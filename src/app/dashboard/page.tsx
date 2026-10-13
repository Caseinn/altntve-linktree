import { Suspense } from "react"

import { SiteForm } from "@/components/site-form"
import { getSite } from "@/lib/queries"

export const metadata = { title: "Profile" }

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

async function ProfileEditor() {
  const site = await getSite()

  return (
    <SiteForm
      defaults={{
        avatarUrl: site.avatarUrl ?? "",
        bio: site.bio ?? "",
        displayName: site.displayName,
        email: site.email ?? "",
        location: site.location ?? "",
        tagline: site.tagline,
      }}
    />
  )
}
