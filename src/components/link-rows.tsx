import { CaretRight } from "@phosphor-icons/react/dist/ssr/CaretRight"

import { LinkIcon } from "@/components/link-icon"
import { getLinkRows } from "@/lib/queries"
import { publicLinkHref } from "@/lib/routes"

export async function LinkRows() {
  const links = await getLinkRows()

  if (links.length === 0) return null

  return (
    <ul>
      {links.map((link) => (
        <li
          className="border-b border-foreground/15 first:border-t"
          key={link.id}
        >
          <a
            className="group flex items-center gap-5 px-6 py-6 transition-colors hover:bg-neutral-100"
            href={publicLinkHref(link.slug)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-neutral-200 transition-colors group-hover:bg-foreground group-hover:text-background">
              <LinkIcon className="size-5" icon={link.icon} />
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-base font-medium">{link.title}</span>
              {link.note ? (
                <span className="text-xs text-neutral-500">{link.note}</span>
              ) : null}
            </span>

            <CaretRight
              aria-hidden
              className="size-4 shrink-0 text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
            />
          </a>
        </li>
      ))}
    </ul>
  )
}
