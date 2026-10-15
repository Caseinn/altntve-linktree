import { AVATAR_ICON_KEY } from "@/lib/avatar"
import { avatarIconResponse, getAvatarIcon } from "@/lib/avatar-icon"

export const size = { height: 32, width: 32 }
export const contentType = "image/png"

/**
 * Serves the uploaded avatar as the browser tab favicon, falling back to a
 * transparent pixel so the route stays valid before the first upload.
 */
export default async function Icon() {
  return avatarIconResponse(await getAvatarIcon(AVATAR_ICON_KEY), contentType)
}
