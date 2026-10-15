import "server-only"
import { cacheLife, cacheTag } from "next/cache"

import { downloadAvatar } from "@/lib/avatar"
import { CACHE_TAGS } from "@/lib/queries"

/** 1x1 transparent PNG, served until an avatar has been uploaded. */
const FALLBACK_ICON =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

/**
 * Builds the response for an icon route.
 *
 * `icon.tsx` and `apple-icon.tsx` are identical apart from the key they read and
 * the size they declare, so the fallback and the encoding live here once.
 *
 * @param base64 - Result of `getAvatarIcon`, or `null` before the first upload.
 * @param contentType - The route's declared `contentType`.
 * @returns A PNG response, transparent until an avatar exists.
 */
export function avatarIconResponse(base64: null | string, contentType: string) {
  return new Response(Buffer.from(base64 ?? FALLBACK_ICON, "base64"), {
    headers: { "content-type": contentType },
  })
}

/**
 * Reads a stored avatar icon for the `icon` and `apple-icon` routes.
 *
 * Tagged with the site cache tag so `updateSite` busts it, and returns base64
 * rather than a Buffer because cached values have to survive serialisation.
 *
 * @param key - Object key of the PNG variant to serve.
 * @returns Base64-encoded PNG bytes, or `null` when no avatar is stored.
 */
export async function getAvatarIcon(key: string) {
  "use cache"
  cacheLife("hours")
  cacheTag(CACHE_TAGS.site)

  const bytes = await downloadAvatar(key)

  return bytes?.toString("base64") ?? null
}
