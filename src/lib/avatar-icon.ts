import "server-only"
import { cacheLife, cacheTag } from "next/cache"

import { downloadAvatar } from "@/lib/avatar"
import { CACHE_TAGS } from "@/lib/queries"

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
