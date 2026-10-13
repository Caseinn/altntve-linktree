import { Emblem } from "@/components/emblem"
import { Wordmark } from "@/components/wordmark"

export function SiteFooter() {
  return (
    <footer className="flex flex-col">
      <div className="flex items-start justify-between border-t border-foreground/15 pt-6">
        <Emblem className="mt-1 size-5 text-neutral-400" />
        <div className="flex flex-col items-end leading-none">
          <Wordmark className="text-sm brand" />
          <a
            className="mt-0.5 text-[0.6rem] text-neutral-300 transition-colors hover:text-foreground"
            href="https://caseinn.web.id"
            rel="noopener noreferrer"
            target="_blank"
          >
            Dev by Caseinn
          </a>
        </div>
      </div>
    </footer>
  )
}
