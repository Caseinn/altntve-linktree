import type { MetadataRoute } from "next"

import { ROUTES } from "@/lib/routes"

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
