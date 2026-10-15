import { createElement } from "react"

import { getIcon } from "@/lib/icons"

/**
 * Renders a link's icon at the thin weight the rest of the icons use.
 *
 * Renders nothing when the link has no icon or an unrecognised one, so a
 * misconfigured row shows a gap rather than a broken glyph.
 *
 * @param props - Stored icon code and the sizing class to apply.
 */
export function LinkIcon({
  className,
  icon,
}: {
  className?: string
  icon: null | string
}) {
  const Icon = getIcon(icon)

  if (!Icon) return null

  return createElement(Icon, {
    "aria-hidden": true,
    className,
    weight: "thin",
  })
}
