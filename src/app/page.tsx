import { Suspense } from "react"

import { BackgroundPlate } from "@/components/background-plate"
import { LinkRows } from "@/components/link-rows"
import { PageShell } from "@/components/page-shell"
import { ShareButton } from "@/components/share-button"
import { SiteProfile } from "@/components/site-profile"
import { SocialRow } from "@/components/social-row"
import { buildMetadata } from "@/lib/metadata"
import { getSite } from "@/lib/queries"

export async function generateMetadata() {
  return buildMetadata(await getSite())
}

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
