const DEFAULT_ORIGIN = "http://localhost:3000"

export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_ORIGIN
).replace(/\/$/, "")

export const absoluteUrl = (path: string) =>
  `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`
