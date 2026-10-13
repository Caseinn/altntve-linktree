export const BRAND = {
  name: "ALTNTVE",
  tagline: "Setiap Ide Punya Cerita Yang Layak Disampaikan.",
} as const

export const LINK_KINDS = ["social", "link"] as const

export type LinkKind = (typeof LINK_KINDS)[number]

export const LINK_KIND_LABELS: Record<LinkKind, string> = {
  link: "Link Row",
  social: "Social Row",
}
