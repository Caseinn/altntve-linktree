import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV === "development"

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : null

const connectSrc = ["'self'", ...(isDev ? ["ws:", "http:"] : [])]

const imgSrc = [
  "'self'",
  "blob:",
  "data:",
  "https://avatars.githubusercontent.com",
  "https://*.fbcdn.net",
  ...(supabaseHost ? [`https://${supabaseHost}`] : []),
]

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src ${imgSrc.join(" ")}`,
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(" ")}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
]

/**
 * Avatar uploads are multipart POSTs, and the 1MB default is below a single
 * modern phone photo. `proxy.ts` buffers request bodies against its own
 * separate 10MB limit, which stays the effective ceiling.
 */
const SERVER_ACTION_BODY_LIMIT = "6mb"

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: SERVER_ACTION_BODY_LIMIT,
    },
  },

  async headers() {
    return [
      {
        headers: securityHeaders,
        source: "/:path*",
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        hostname: "**.fbcdn.net",
        protocol: "https",
      },
      ...(supabaseHost
        ? ["avatar", "background"].map((bucket) => ({
            hostname: supabaseHost,
            pathname: `/storage/v1/object/public/${bucket}/**`,
            protocol: "https" as const,
          }))
        : []),
    ],
  },

  partialPrefetching: true,

  serverExternalPackages: ["sharp"],

  turbopack: {
    rules: {
      "*.css": {
        as: "*.css",
        loaders: ["@tailwindcss/turbopack"],
      },
    },
  },
}

export default nextConfig
