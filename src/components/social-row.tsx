import { LinkIcon } from "@/components/link-icon"
import { Skeleton } from "@/components/ui/skeleton"
import { getSocialLinks } from "@/lib/queries"
import { publicLinkHref } from "@/lib/routes"

/** Visible social links as a wrapped icon row on the public page. */
export async function SocialRow() {
  const links = await getSocialLinks()

  if (links.length === 0) return null

  return (
    <section aria-label="Kanal">
      <ul className="flex flex-wrap items-start gap-x-12 gap-y-6 px-3">
        {links.map((link) => (
          <li key={link.id}>
            <a
              className="group flex flex-col items-center gap-3"
              href={publicLinkHref(link.slug)}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-neutral-200 transition-colors group-hover:bg-foreground group-hover:text-background">
                <LinkIcon className="size-5" icon={link.icon} />
              </span>

              <span className="text-xs text-neutral-600 transition-colors group-hover:text-foreground">
                {link.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Placeholder for `SocialRow`, matching its wrapping and footprint. */
SocialRow.Skeleton = function SocialRowSkeleton() {
  return (
    <ul className="flex items-start gap-x-12 gap-y-6 px-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <li className="flex flex-col items-center gap-3" key={index}>
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-3 w-14" />
        </li>
      ))}
    </ul>
  )
}
