import "server-only"
import sharp from "sharp"

import { BACKGROUND } from "@/config/brand"
import { createClient } from "@/lib/supabase/server"

export const BACKGROUND_AVIF_KEY = "background.avif"
export const BACKGROUND_BUCKET = "background"
export const BACKGROUND_WEBP_KEY = "background.webp"

const BACKGROUND_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
const BACKGROUND_MAX_BYTES = 5 * 1024 * 1024
const AVIF_EFFORT = 3
const AVIF_QUALITY = 55
const WEBP_QUALITY = 78

/** Every rejection an upload can produce, so callers can tell a validation failure from a fault. */
export class BackgroundError extends Error {}

/** Deletes the stored background objects. */
export async function removeBackground() {
  const supabase = await createClient()

  await supabase.storage
    .from(BACKGROUND_BUCKET)
    .remove([BACKGROUND_AVIF_KEY, BACKGROUND_WEBP_KEY])
}

/**
 * Re-encodes an upload into the AVIF/WebP pair the plate renders.
 *
 * Uploads are cropped to the plate's ratio here rather than rejected, and the
 * query stamp on the returned URLs is needed because the object keys are fixed
 * and the CDN would otherwise serve the previous upload.
 *
 * @param file - Raw upload from the admin's form.
 * @returns Cache-busted public URLs for both formats.
 * @throws {BackgroundError} When the MIME type, size, or image data is rejected.
 */
export async function storeBackground(file: File) {
  if (!BACKGROUND_MIME_TYPES.includes(file.type)) {
    throw new BackgroundError("Background must be a JPEG, PNG, or WebP image")
  }

  if (file.size > BACKGROUND_MAX_BYTES) {
    throw new BackgroundError("Background must be smaller than 5 MB")
  }

  const variants = await encodeBackground(Buffer.from(await file.arrayBuffer()))
  const supabase = await createClient()
  const bucket = supabase.storage.from(BACKGROUND_BUCKET)

  await Promise.all([
    putObject(bucket, BACKGROUND_AVIF_KEY, variants.avif, "image/avif"),
    putObject(bucket, BACKGROUND_WEBP_KEY, variants.webp, "image/webp"),
  ])

  const stamp = Date.now()

  return {
    avifUrl: cacheBust(
      bucket.getPublicUrl(BACKGROUND_AVIF_KEY).data.publicUrl,
      stamp,
    ),
    webpUrl: cacheBust(
      bucket.getPublicUrl(BACKGROUND_WEBP_KEY).data.publicUrl,
      stamp,
    ),
  }
}

function cacheBust(url: string, stamp: number) {
  return `${url}?v=${stamp}`
}

/**
 * @param input - Untrusted bytes from the browser.
 * @returns The AVIF primary and its WebP fallback, both at the plate's ratio.
 * @throws {BackgroundError} When the bytes cannot be decoded.
 */
async function encodeBackground(input: Buffer) {
  const source = sharp(input).rotate()
  const plate = () =>
    source.clone().resize(BACKGROUND.width, BACKGROUND.height, {
      fit: "cover",
      position: "centre",
    })

  try {
    const [avif, webp] = await Promise.all([
      plate().avif({ effort: AVIF_EFFORT, quality: AVIF_QUALITY }).toBuffer(),
      plate().webp({ quality: WEBP_QUALITY }).toBuffer(),
    ])

    return { avif, webp }
  } catch {
    throw new BackgroundError("That file could not be read as an image")
  }
}

async function putObject(
  bucket: ReturnType<
    Awaited<ReturnType<typeof createClient>>["storage"]["from"]
  >,
  key: string,
  body: Buffer,
  contentType: string,
) {
  const { error } = await bucket.upload(key, body, {
    cacheControl: "31536000",
    contentType,
    upsert: true,
  })

  if (error) {
    throw new BackgroundError(`Could not save the background: ${error.message}`)
  }
}
