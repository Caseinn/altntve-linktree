import { AVATAR_APPLE_KEY } from "@/lib/avatar"
import { getAvatarIcon } from "@/lib/avatar-icon"

export const size = { height: 180, width: 180 }
export const contentType = "image/png"

/** 1x1 transparent PNG, served until an avatar has been uploaded. */
const FALLBACK_ICON =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

/**
 * Serves the uploaded avatar as the iOS home-screen icon, falling back to a
 * transparent pixel so the route stays valid before the first upload.
 */
export default async function AppleIcon() {
  const icon = await getAvatarIcon(AVATAR_APPLE_KEY)

  return new Response(Buffer.from(icon ?? FALLBACK_ICON, "base64"), {
    headers: { "content-type": contentType },
  })
}
