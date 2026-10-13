import "server-only"
import { createClient as createPublicClient } from "@supabase/supabase-js"
import sharp, { type Sharp } from "sharp"

import { getSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"

export const AVATAR_APPLE_KEY = "site-apple.png"
export const AVATAR_BUCKET = "avatar"
export const AVATAR_ICON_KEY = "site-icon.png"
export const AVATAR_KEY = "site.webp"

const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
const AVATAR_MAX_BYTES = 5 * 1024 * 1024
const AVATAR_SIZE = 512
const WEBP_QUALITY = 82

/**
 * Thrown for every rejection an avatar upload can produce, so callers can tell
 * a user-facing validation failure apart from an unexpected fault.
 */
export class AvatarError extends Error {}

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
 * The returned URL carries a cache-busting query because the object keys are
 * fixed, so the CDN would otherwise keep serving the previous upload for up to
 * an hour after a replacement.
 *
 * @param file - Raw upload taken from the admin's form.
 * @returns A cache-busted public URL for the 512px WebP avatar.
 * @throws {AvatarError} When the MIME type, size, or image data is rejected.
 */
export async function storeAvatar(file: File): Promise<string> {
  if (!AVATAR_MIME_TYPES.includes(file.type)) {
    throw new AvatarError("Avatar must be a JPEG, PNG, or WebP image")
  }

  if (file.size > AVATAR_MAX_BYTES) {
    throw new AvatarError("Avatar must be smaller than 5 MB")
  }

  const variants = await encodeAvatar(Buffer.from(await file.arrayBuffer()))

  const supabase = await createClient()
  await putObject(supabase, AVATAR_KEY, variants.main, "image/webp")
  await Promise.all([
    putObject(supabase, AVATAR_ICON_KEY, variants.icon, "image/png"),
    putObject(supabase, AVATAR_APPLE_KEY, variants.apple, "image/png"),
  ])

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(AVATAR_KEY)

  return `${data.publicUrl}?v=${Date.now()}`
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
 * @throws {AvatarError} When the bytes cannot be decoded as an image.
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
    throw new AvatarError("That file could not be read as an image")
  }
}

async function putObject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: string,
  body: Buffer,
  contentType: string,
) {
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(key, body, {
      cacheControl: "31536000",
      contentType,
      upsert: true,
    })

  if (error) throw new AvatarError("Could not save the image. Try again.")
}

function square(image: Sharp, size: number) {
  return image.resize(size, size, { fit: "cover", position: "centre" })
}
