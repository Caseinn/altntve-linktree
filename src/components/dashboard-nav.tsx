"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ROUTES } from "@/lib/routes"

const NAV = [
  { href: ROUTES.dashboard, label: "Profile" },
  { href: ROUTES.dashboardLinks, label: "Links" },
] as const

/**
 * Dashboard section links, marking the current one for assistive tech.
 *
 * A client component because the active section depends on the current path.
 */
export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-6">
      {NAV.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "editorial text-foreground"
                : "editorial text-neutral-500 transition-colors hover:text-foreground"
            }
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
