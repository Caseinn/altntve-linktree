import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env"
import { ROUTES } from "@/lib/routes"

const PROTECTED_PREFIX = ROUTES.dashboard
const AUTH_PAGES: ReadonlySet<string> = new Set([ROUTES.login])

const isProd = process.env.NODE_ENV === "production"

type CookieOptions = {
  domain?: string
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: "lax" | "none" | "strict" | boolean
  secure?: boolean
}

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
          response.cookies.set(name, value, secureOptions(options)),
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

function secureOptions(options: CookieOptions): CookieOptions {
  return {
    ...options,
    httpOnly: options.httpOnly ?? true,
    path: options.path ?? "/",
    sameSite: options.sameSite ?? "lax",
    secure: options.secure ?? isProd,
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
