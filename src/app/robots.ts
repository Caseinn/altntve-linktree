import type { MetadataRoute } from "next"

import { ROUTES } from "@/lib/routes"

/**
 * Crawl rules for the site.
 *
 * The dashboard, the login page, and the redirect paths are all disallowed: the
 * first two lead nowhere public, and `/l/` exists only to bounce a visitor to a
 * third party.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: "/",
        disallow: [`${ROUTES.dashboard}`, ROUTES.login, "/l/"],
        userAgent: "*",
      },
    ],
  }
}
