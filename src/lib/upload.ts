import "server-only"

import type { createClient } from "@/lib/supabase/server"

/** A storage bucket handle, as returned by `supabase.storage.from(...)`. */
export type StorageBucket = ReturnType<StorageClient["storage"]["from"]>

type StorageClient = Awaited<ReturnType<typeof createClient>>

/** Image types every upload field accepts. */
export const UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024

const CACHE_CONTROL = "31536000"
const MAX_MEGABYTES = UPLOAD_MAX_BYTES / 1024 / 1024

/**
 * Thrown for every rejection an upload can produce, so callers can tell a
 * user-facing validation failure apart from an unexpected fault.
 *
 * One class covers both the avatar and the background pipeline: the message text
 * already carries the field name, and a per-field subclass would only invite the
 * two callers to drift apart again.
 */
export class UploadError extends Error {}

/**
 * Rejects a file on type and size before any bytes are read or written.
 *
 * Pure and synchronous, so a caller can screen every field in a submission
 * before the first upload lands and leaves orphaned objects behind.
 *
 * @param file - Raw upload taken from the admin's form.
 * @param label - Field name used in the messages, e.g. `"Avatar"`.
 * @throws {UploadError} When the MIME type or size is rejected.
 */
export function assertUploadable(file: File, label: string): void {
  if (!UPLOAD_MIME_TYPES.includes(file.type)) {
    throw new UploadError(`${label} must be a JPEG, PNG, or WebP image`)
  }

  if (file.size > UPLOAD_MAX_BYTES) {
    throw new UploadError(`${label} must be smaller than ${MAX_MEGABYTES} MB`)
  }
}

/**
 * Appends a revision stamp to a public URL.
 *
 * Needed because the object keys are fixed, so the CDN would otherwise keep
 * serving the previous upload for up to an hour after a replacement.
 */
export function cacheBust(url: string, stamp: number): string {
  return `${url}?v=${stamp}`
}

/**
 * Writes one encoded variant, overwriting whatever is at that key.
 *
 * @param bucket - Bucket handle to write into.
 * @param key - Fixed object key; uploads upsert over the previous revision.
 * @param body - Encoded image bytes.
 * @param contentType - MIME type stored alongside the object.
 * @param label - Noun used in the failure message, e.g. `"background"`.
 * @throws {UploadError} When storage rejects the write.
 */
export async function putObject(
  bucket: StorageBucket,
  key: string,
  body: Buffer,
  contentType: string,
  label: string,
): Promise<void> {
  const { error } = await bucket.upload(key, body, {
    cacheControl: CACHE_CONTROL,
    contentType,
    upsert: true,
  })

  if (error) {
    throw new UploadError(`Could not save the ${label}: ${error.message}`)
  }
}
