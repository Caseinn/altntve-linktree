import Image from "next/image"

import { Skeleton } from "@/components/ui/skeleton"
import { getSite } from "@/lib/queries"

/**
 * Public profile header.
 *
 * The avatar is rendered with `unoptimized` because it is already a 256px
 * square WebP cut to display size at upload time. The optimizer would add a
 * server round trip that buys nothing and fails outright whenever DNS hands
 * back a private address.
 *
 * `fetchPriority` marks it as the LCP element; without it `next/image` defers
 * the load, which delays the largest paint on the page.
 */
export async function SiteProfile() {
  const site = await getSite()

  return (
    <header className="flex flex-col gap-6">
      <div className="flex items-start gap-5">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-1 ring-foreground/10">
          {site.avatarUrl ? (
            <Image
              alt={site.displayName}
              className="object-cover"
              fetchPriority="high"
              fill
              sizes="80px"
              src={site.avatarUrl}
              unoptimized
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <h1 className="text-2xl leading-none brand sm:text-3xl">
            {site.displayName}
          </h1>

          <p className="text-sm leading-relaxed text-neutral-600">
            {site.tagline}
          </p>
        </div>
      </div>

      {site.bio ? (
        <div className="flex max-w-prose flex-col gap-3">
          {site.bio.split(/\n{2,}/).map((paragraph, index) => (
            <p
              className="text-sm leading-relaxed whitespace-pre-line text-neutral-600"
              key={index}
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {site.email || site.location ? (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          {site.location ? (
            <a
              className="editorial text-neutral-500 transition-colors hover:text-foreground"
              href={mapUrl(site.location)}
              rel="noopener noreferrer"
              target="_blank"
            >
              {site.location}
            </a>
          ) : null}

          {site.email ? (
            <a
              className="editorial text-neutral-500 transition-colors hover:text-foreground"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}

function mapUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

/** Placeholder for `SiteProfile`, matching its avatar and heading footprint. */
SiteProfile.Skeleton = function SiteProfileSkeleton() {
  return (
    <header className="flex flex-col gap-6">
      <div className="flex items-start gap-5">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex flex-col gap-2 pt-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="flex w-full max-w-prose flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </header>
  )
}
