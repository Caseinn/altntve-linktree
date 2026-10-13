import "server-only"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getSupabaseEnv } from "@/lib/env"

/**
 * Builds a request-scoped Supabase client bound to the incoming cookies.
 *
 * `setAll` cannot write cookies from a Server Component, where the store is
 * read-only. That failure is swallowed on purpose: `proxy.ts` already refreshes
 * the session on every matched request, so the render does not need to.
 */
export async function createClient() {
  const { key, url } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) =>
            cookieStore.set(name, value, options),
          )
        } catch {}
      },
    },
  })
}
