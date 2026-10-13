import { Emblem } from "@/components/emblem"
import { Wordmark } from "@/components/wordmark"

export function SiteFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-foreground/15 pt-6">
      <Emblem className="size-5 text-neutral-400" />
      <Wordmark className="text-sm brand" />
    </footer>
  )
}
