import type { MetadataRoute } from "next"

import { SITE_ORIGIN } from "@/lib/url"

/** Single-entry sitemap: the public page is the only indexable route. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 1,
      url: SITE_ORIGIN,
    },
  ]
}
