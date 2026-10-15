import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env"
import { ROUTES } from "@/lib/routes"

const PROTECTED_PREFIX = ROUTES.dashboard
const AUTH_PAGES: ReadonlySet<string> = new Set([ROUTES.login])

type CookieOptions = {
  domain?: string
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: "lax" | "none" | "strict" | boolean
  secure?: boolean
}

/**
 * Refreshes the Supabase session and guards the dashboard.
 *
 * Running here means every matched request carries a fresh access token, which is
 * why the server client is free to ignore writes to its cookie store. The
 * redirect is UX only; every action re-checks the admin allow-list.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const needsAuthCheck =
    pathname.startsWith(PROTECTED_PREFIX) || AUTH_PAGES.has(pathname)

  if (!needsAuthCheck || !hasSupabaseEnv()) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })
  const { key, url } = getSupabaseEnv()

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, options, value }) =>
          response.cookies.set(
            name,
            value,
            secureOptions(options, isHttpsRequest(request)),
          ),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && pathname.startsWith(PROTECTED_PREFIX)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = ROUTES.login
    return NextResponse.redirect(redirectUrl)
  }

  if (user && AUTH_PAGES.has(pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = ROUTES.dashboard
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

/**
 * Whether this request arrived over TLS.
 *
 * `x-forwarded-proto` is checked first because a load balancer terminates TLS
 * and the request URL alone then reports plain `http`. Getting this wrong in the
 * permissive direction only weakens the cookie flag, whereas flagging a cookie
 * `Secure` on a plain-HTTP host makes the browser drop it and breaks sign-in
 * with no error — so an unrecognised request is treated as insecure.
 */
function isHttpsRequest(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]
  if (forwarded) return forwarded.trim() === "https"
  return request.nextUrl.protocol === "https:"
}

function secureOptions(
  options: CookieOptions,
  isHttps: boolean,
): CookieOptions {
  return {
    ...options,
    httpOnly: options.httpOnly ?? true,
    path: options.path ?? "/",
    sameSite: options.sameSite ?? "lax",
    secure: options.secure ?? isHttps,
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
