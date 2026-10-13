import Link from "next/link"

import { Emblem } from "@/components/emblem"
import { Wordmark } from "@/components/wordmark"
import { ROUTES } from "@/lib/routes"

export function BrandHeader() {
  return (
    <header className="flex items-center gap-2.5">
      <Emblem className="size-6 text-foreground" />
      <Link href={ROUTES.home}>
        <Wordmark className="text-sm brand" />
      </Link>
    </header>
  )
}
