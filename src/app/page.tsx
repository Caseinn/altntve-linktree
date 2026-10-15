import { Suspense } from "react"

import { BackgroundPlate } from "@/components/background-plate"
import { LinkRows } from "@/components/link-rows"
import { PageShell } from "@/components/page-shell"
import { ShareButton } from "@/components/share-button"
import { SiteProfile } from "@/components/site-profile"
import { SocialRow } from "@/components/social-row"
import { buildMetadata } from "@/lib/metadata"
import { getSite } from "@/lib/queries"

/** Metadata for the public page, from the stored profile. */
export async function generateMetadata() {
  return buildMetadata(await getSite())
}

/**
 * The public page.
 *
 * Each section waits on its own cached query behind a matching skeleton, so one
 * slow section never holds back the others.
 */
export default async function Page() {
  const site = await getSite()

  return (
    <>
      <BackgroundPlate
        avifUrl={site.backgroundAvifUrl}
        opacity={site.backgroundOpacity}
        webpUrl={site.backgroundWebpUrl}
      />

      <PageShell>
        <Suspense fallback={<SiteProfile.Skeleton />}>
          <SiteProfile />
        </Suspense>

        <Suspense fallback={<SocialRow.Skeleton />}>
          <SocialRow />
        </Suspense>

        <Suspense fallback={null}>
          <LinkRows />
        </Suspense>
      </PageShell>

      <ShareButton text={site.tagline} title={site.displayName} />
    </>
  )
}
