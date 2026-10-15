import type { Metadata } from "next"

import { BRAND } from "@/config/brand"
import { absoluteUrl } from "@/lib/url"

/**
 * Builds the public page's metadata from the stored profile.
 *
 * @param site - Display name and tagline from `getSite`.
 * @returns Canonical, Open Graph, and Twitter metadata.
 */
export function buildMetadata(site: {
  displayName: string
  tagline: string
}): Metadata {
  const description = site.tagline || BRAND.tagline
  const title = `${site.displayName} — ${description}`

  return {
    alternates: { canonical: absoluteUrl("/") },
    applicationName: site.displayName,
    description,
    openGraph: {
      description,
      locale: "id_ID",
      siteName: site.displayName,
      title,
      type: "website",
      url: absoluteUrl("/"),
    },
    robots: {
      follow: true,
      index: true,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      title,
    },
  }
}
