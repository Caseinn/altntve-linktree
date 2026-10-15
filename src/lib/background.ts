import "server-only"
import sharp from "sharp"

import { BACKGROUND } from "@/config/brand"
import { createClient } from "@/lib/supabase/server"
import {
  assertUploadable,
  cacheBust,
  putObject,
  UploadError,
} from "@/lib/upload"

/**
 * Object keys the background pipeline owns, one per delivered format.
 *
 * Fixed so each upload replaces the last one; the stored URLs carry a `?v=` stamp
 * to defeat CDN caching on top of that.
 */
export const BACKGROUND_AVIF_KEY = "background.avif"
export const BACKGROUND_BUCKET = "background"
export const BACKGROUND_WEBP_KEY = "background.webp"

const AVIF_EFFORT = 3
const AVIF_QUALITY = 55
const WEBP_QUALITY = 78

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
 * Uploads are cropped to the plate's ratio here rather than rejected.
 *
 * @param file - Raw upload from the admin's form.
 * @returns Cache-busted public URLs for both formats.
 * @throws {UploadError} When the MIME type, size, or image data is rejected.
 */
export async function storeBackground(file: File) {
  assertUploadable(file, "Background")

  const variants = await encodeBackground(Buffer.from(await file.arrayBuffer()))
  const bucket = (await createClient()).storage.from(BACKGROUND_BUCKET)

  await Promise.all([
    putObject(
      bucket,
      BACKGROUND_AVIF_KEY,
      variants.avif,
      "image/avif",
      "background",
    ),
    putObject(
      bucket,
      BACKGROUND_WEBP_KEY,
      variants.webp,
      "image/webp",
      "background",
    ),
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

/**
 * @param input - Untrusted bytes from the browser.
 * @returns The AVIF primary and its WebP fallback, both at the plate's ratio.
 * @throws {UploadError} When the bytes cannot be decoded.
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
    throw new UploadError("That file could not be read as an image")
  }
}
