import { Suspense } from "react"

import { LinksManager } from "@/components/links-manager"
import { getAllLinks } from "@/lib/queries"

export const metadata = { title: "Links" }

export default function Page() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="editorial text-neutral-500">Links</h1>

      <Suspense
        fallback={<p className="text-sm text-neutral-500">Loading...</p>}
      >
        <LinksTable />
      </Suspense>
    </section>
  )
}

async function LinksTable() {
  const links = await getAllLinks()
  return <LinksManager links={links} />
}
