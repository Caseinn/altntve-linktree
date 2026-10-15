import Link from "next/link"
import { redirect } from "next/navigation"
import { connection } from "next/server"

import { signOut } from "@/app/actions"
import { DashboardNav } from "@/components/dashboard-nav"
import { Emblem } from "@/components/emblem"
import { PageShell } from "@/components/page-shell"
import { Wordmark } from "@/components/wordmark"
import { isAdmin } from "@/lib/auth"
import { ROUTES } from "@/lib/routes"

export const instant = false

/**
 * Dashboard chrome: brand header, sign out, and section nav.
 *
 * Forced dynamic with `connection()` because the admin check reads cookies, and
 * re-checked here so a lapsed session lands on the login page rather than a
 * half-rendered dashboard.
 */
export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  await connection()

  if (!(await isAdmin())) {
    redirect(ROUTES.login)
  }

  return (
    <PageShell
      header={
        <header className="flex items-center justify-between border-b border-foreground/15 pb-5">
          <Link className="flex items-center gap-2.5" href={ROUTES.home}>
            <Emblem className="size-6 text-foreground" />
            <Wordmark className="text-sm brand" />
          </Link>

          <form action={signOut}>
            <button
              className="cursor-pointer editorial text-neutral-500 transition-colors hover:text-foreground"
              type="submit"
            >
              Sign Out
            </button>
          </form>
        </header>
      }
    >
      <div className="flex flex-col gap-10 sm:gap-12">
        <DashboardNav />

        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </PageShell>
  )
}
