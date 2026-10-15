import "server-only"
import { createClient as createPublicClient } from "@supabase/supabase-js"
import sharp, { type Sharp } from "sharp"

import { getSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import {
  assertUploadable,
  cacheBust,
  putObject,
  UploadError,
} from "@/lib/upload"

/**
 * Object keys the avatar pipeline owns.
 *
 * Fixed so each upload replaces the last one rather than accumulating objects;
 * the stored URLs carry a `?v=` stamp to defeat CDN caching on top of that.
 */
export const AVATAR_APPLE_KEY = "site-apple.png"
export const AVATAR_BUCKET = "avatar"
export const AVATAR_ICON_KEY = "site-icon.png"
export const AVATAR_KEY = "site.webp"

const AVATAR_SIZE = 256
const WEBP_QUALITY = 82

/**
 * Reads a stored avatar object.
 *
 * Uses a cookie-free client so this stays callable from a `use cache` scope,
 * where request-bound Supabase clients are unavailable.
 *
 * @param key - Object key within the avatar bucket.
 * @returns The object bytes, or `null` when it does not exist.
 */
export async function downloadAvatar(key: string) {
  const { key: publishableKey, url } = getSupabaseEnv()
  const supabase = createPublicClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .download(key)
  if (error || !data) return null

  return Buffer.from(await data.arrayBuffer())
}

/**
 * Deletes every avatar object. Best effort: a failure here leaves orphaned
 * bytes in the bucket rather than blocking the profile update.
 */
export async function removeAvatar() {
  const supabase = await createClient()

  await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([AVATAR_KEY, AVATAR_ICON_KEY, AVATAR_APPLE_KEY])
}

/**
 * Re-encodes an uploaded file into the three objects the site renders, and
 * returns the public URL of the main one.
 *
 * The main object is written before the two icon variants so a mid-flight failure
 * leaves the previous icons paired with the new main image, which is less jarring
 * than a stale main image behind fresh icons.
 *
 * @param file - Raw upload taken from the admin's form.
 * @returns A cache-busted public URL for the 256px WebP avatar.
 * @throws {UploadError} When the MIME type, size, or image data is rejected.
 */
export async function storeAvatar(file: File): Promise<string> {
  assertUploadable(file, "Avatar")

  const variants = await encodeAvatar(Buffer.from(await file.arrayBuffer()))
  const bucket = (await createClient()).storage.from(AVATAR_BUCKET)

  await putObject(bucket, AVATAR_KEY, variants.main, "image/webp", "image")
  await Promise.all([
    putObject(bucket, AVATAR_ICON_KEY, variants.icon, "image/png", "image"),
    putObject(bucket, AVATAR_APPLE_KEY, variants.apple, "image/png", "image"),
  ])

  return cacheBust(bucket.getPublicUrl(AVATAR_KEY).data.publicUrl, Date.now())
}

/**
 * Produces every rendered avatar variant from one upload.
 *
 * `rotate()` applies the EXIF orientation, and sharp discards all metadata on
 * encode unless `withMetadata()` is called, so GPS coordinates never reach the
 * bucket.
 *
 * @param input - Untrusted bytes straight from the browser.
 * @returns The main WebP plus the favicon and Apple touch-icon PNGs.
 * @throws {UploadError} When the bytes cannot be decoded as an image.
 */
async function encodeAvatar(input: Buffer) {
  const source = sharp(input).rotate()

  try {
    const [apple, icon, main] = await Promise.all([
      square(source.clone(), 180).png().toBuffer(),
      square(source.clone(), 32).png().toBuffer(),
      square(source.clone(), AVATAR_SIZE)
        .webp({ quality: WEBP_QUALITY })
        .toBuffer(),
    ])

    return { apple, icon, main }
  } catch {
    throw new UploadError("That file could not be read as an image")
  }
}

function square(image: Sharp, size: number) {
  return image.resize(size, size, { fit: "cover", position: "centre" })
}
