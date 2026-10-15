/** Every internal path, so links to the app's own routes are spelled once. */
export const ROUTES = {
  dashboard: "/dashboard",
  dashboardLinks: "/dashboard/links",
  home: "/",
  login: "/login",
} as const

/**
 * Public path for a slug.
 *
 * Returned as a literal type so `typedRoutes` can check it against the generated
 * route table.
 */
export const publicLinkHref = (slug: string) => `/l/${slug}` as const

/**
 * Derives a link slug from a title.
 *
 * Lives here rather than in `schemas.ts` so the dashboard can preview the slug
 * live while typing without pulling the Zod schemas into the client bundle.
 * The create action slugifies the title on the server, so this copy is a
 * preview of that same rule and never the value that gets written.
 */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60)
    .replace(/^-+|-+$/g, "")
}
