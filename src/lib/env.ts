/**
 * Admin allow-list, lowercased for case-insensitive comparison.
 *
 * Read per call rather than cached, so it stays correct across a restart with a
 * different environment and never holds a stale value in the module scope.
 */
export function getAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

/**
 * Supabase connection settings.
 *
 * @throws When either value is missing, naming the file to fix rather than
 * letting an opaque client construction failure surface later.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. See .env.example.",
    )
  }

  return { key, url }
}

/**
 * Whether Supabase is configured at all.
 *
 * Lets the dashboard and the proxy answer unauthenticated rather than throwing,
 * so a fresh checkout renders the login page instead of an error boundary.
 */
export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
}
