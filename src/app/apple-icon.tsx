import { AVATAR_APPLE_KEY } from "@/lib/avatar"
import { avatarIconResponse, getAvatarIcon } from "@/lib/avatar-icon"

export const size = { height: 180, width: 180 }
export const contentType = "image/png"

/**
 * Serves the uploaded avatar as the iOS home-screen icon, falling back to a
 * transparent pixel so the route stays valid before the first upload.
 */
export default async function AppleIcon() {
  return avatarIconResponse(await getAvatarIcon(AVATAR_APPLE_KEY), contentType)
}
