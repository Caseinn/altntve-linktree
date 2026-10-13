import { Suspense } from "react"

import { BackgroundPlate } from "@/components/background-plate"
import { LinkRows } from "@/components/link-rows"
import { PageShell } from "@/components/page-shell"
import { SiteProfile } from "@/components/site-profile"
import { SocialRow } from "@/components/social-row"
import { buildMetadata } from "@/lib/metadata"
import { getSite } from "@/lib/queries"

export async function generateMetadata() {
  return buildMetadata(await getSite())
}

export default function Page() {
  return (
    <>
      <BackgroundPlate />

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
    </>
  )
}
