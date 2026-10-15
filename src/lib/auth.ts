import "server-only"
import { redirect } from "next/navigation"
import { cache } from "react"

import { getAdminEmails, hasSupabaseEnv } from "@/lib/env"
import { ROUTES } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"

/**
 * The signed-in user, or null when Supabase is not configured.
 *
 * Wrapped in `cache` so a request that checks the session in both a layout and
 * an action only pays for one round trip.
 */
export const getUser = cache(async () => {
  if (!hasSupabaseEnv()) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
})

/** Whether an address appears in the admin allow-list, case-insensitively. */
export function isAdminEmail(email: null | string | undefined) {
  return Boolean(email && getAdminEmails().has(email.toLowerCase()))
}

/** Whether the current request belongs to an admin. */
export const isAdmin = cache(async () => isAdminEmail((await getUser())?.email))

/**
 * Gate for every mutating action.
 *
 * Redirects rather than throwing: a session can lapse between the page render
 * and the submit, and an opaque error boundary would leave the admin with no
 * way forward.
 */
export async function requireAdmin() {
  if (!(await isAdmin())) {
    redirect(ROUTES.login)
  }
}
