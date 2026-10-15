/** Fallback identity, used before an admin has edited the profile. */
export const BRAND = {
  name: "ALTNTVE",
  tagline: "Setiap Ide Punya Cerita Yang Layak Disampaikan.",
} as const

/** Geometry and tone of the public page's background plate. */
export const BACKGROUND = {
  defaultOpacity: 50,
  height: 1350,
  maxOpacity: 100,
  width: 1080,
} as const

/**
 * The two link taxonomies.
 *
 * A union because the schemas branch on it, and each kind renders differently.
 */
export const LINK_KINDS = ["social", "link"] as const

/** Widens {@link LINK_KINDS} into a type, so a schema can branch on it. */
export type LinkKind = (typeof LINK_KINDS)[number]

/** Display name per kind, for the dashboard headings and the kind picker. */
export const LINK_KIND_LABELS: Record<LinkKind, string> = {
  link: "Link Row",
  social: "Social Row",
}
