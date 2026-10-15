const DEFAULT_ORIGIN = "http://localhost:3000"

function resolveSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set. Add it to your environment — see .env.example.",
    )
  }

  return DEFAULT_ORIGIN
}

/**
 * Canonical origin for metadata, canonical URLs, and the sitemap.
 *
 * Falls back to localhost in development only. A production deploy that forgets
 * `NEXT_PUBLIC_SITE_URL` would otherwise ship `rel=canonical`, the sitemap, and
 * every share preview pointing at localhost, so it fails the build instead.
 */
export const SITE_ORIGIN = resolveSiteOrigin().replace(/\/$/, "")

/**
 * Joins a site-rooted path onto {@link SITE_ORIGIN}.
 *
 * @param path - Absolute path; a leading slash is added when missing.
 */
export const absoluteUrl = (path: string) =>
  `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`

/**
 * Protocols a stored link is allowed to point at.
 *
 * Shared by the write path (`schemas.ts`) and the redirect handler
 * (`app/l/[slug]/route.ts`) so the two layers cannot drift apart and disagree on
 * what a valid link is.
 */
export const ALLOWED_LINK_PROTOCOLS: ReadonlySet<string> = new Set([
  "http:",
  "https:",
  "mailto:",
])
