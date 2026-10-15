import { Suspense } from "react"

import { LinksManager } from "@/components/links-manager"
import { getAllLinks } from "@/lib/queries"

export const metadata = { title: "Links" }

/** Links section: heading plus the table behind a suspense boundary. */
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

/** Link table, held back by a boundary so the heading can paint first. */
async function LinksTable() {
  const links = await getAllLinks()
  return <LinksManager links={links} />
}
