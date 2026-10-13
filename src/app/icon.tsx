import { AVATAR_ICON_KEY } from "@/lib/avatar"
import { getAvatarIcon } from "@/lib/avatar-icon"

export const size = { height: 32, width: 32 }
export const contentType = "image/png"

/** 1x1 transparent PNG, served until an avatar has been uploaded. */
const FALLBACK_ICON =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

/**
 * Serves the uploaded avatar as the browser tab favicon, falling back to a
 * transparent pixel so the route stays valid before the first upload.
 */
export default async function Icon() {
  const icon = await getAvatarIcon(AVATAR_ICON_KEY)

  return new Response(Buffer.from(icon ?? FALLBACK_ICON, "base64"), {
    headers: { "content-type": contentType },
  })
}
