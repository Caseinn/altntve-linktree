import { createElement } from "react"

import { getIcon } from "@/lib/icons"

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
