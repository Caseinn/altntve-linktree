import "server-only"
import { cache } from "react"

import { getAdminEmails, hasSupabaseEnv } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"

export const getUser = cache(async () => {
  if (!hasSupabaseEnv()) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
})

export function isAdminEmail(email: null | string | undefined) {
  return Boolean(email && getAdminEmails().has(email.toLowerCase()))
}

export const isAdmin = cache(async () => isAdminEmail((await getUser())?.email))

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }
}
