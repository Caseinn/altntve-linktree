import Link from "next/link"

import { BrandHeader } from "@/components/brand-header"
import { PageShell } from "@/components/page-shell"
import { ROUTES } from "@/lib/routes"

export default function NotFound() {
  return (
    <PageShell header={<BrandHeader />}>
      <div className="flex flex-1 flex-col justify-center gap-6 py-24">
        <p className="editorial text-neutral-500">Error 404</p>

        <h1 className="text-3xl leading-tight brand sm:text-4xl">
          Halaman Tidak Ditemukan
        </h1>

        <p className="max-w-prose text-sm leading-relaxed text-neutral-600">
          Tautan yang kamu cari sudah dipindahkan, diubah, atau tidak pernah
          ada.
        </p>

        <Link
          className="group inline-flex w-fit items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-foreground"
          href={ROUTES.home}
        >
          Kembali ke halaman utama
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            &rarr;
          </span>
        </Link>
      </div>
    </PageShell>
  )
}
