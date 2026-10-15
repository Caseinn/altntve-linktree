import { Suspense } from "react"

import { SiteForm } from "@/components/site-form"
import { getSite } from "@/lib/queries"

export const metadata = { title: "Profile" }

/** Profile section: heading plus the editor behind a suspense boundary. */
export default function Page() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="editorial text-neutral-500">Profile</h1>

      <Suspense
        fallback={<p className="text-sm text-neutral-500">Loading...</p>}
      >
        <ProfileEditor />
      </Suspense>
    </section>
  )
}

/** Profile editor, held back by a boundary so the heading can paint first. */
async function ProfileEditor() {
  const site = await getSite()

  return (
    <SiteForm
      defaults={{
        avatarUrl: site.avatarUrl ?? "",
        backgroundAvifUrl: site.backgroundAvifUrl ?? "",
        backgroundOpacity: site.backgroundOpacity,
        backgroundWebpUrl: site.backgroundWebpUrl ?? "",
        bio: site.bio ?? "",
        displayName: site.displayName,
        email: site.email ?? "",
        location: site.location ?? "",
        tagline: site.tagline,
      }}
    />
  )
}
