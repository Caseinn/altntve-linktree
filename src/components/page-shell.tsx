import { SiteFooter } from "@/components/site-footer"

/**
 * Centred content column with an optional header and the shared footer.
 *
 * @param props - Optional header above the content.
 */
export function PageShell({
  children,
  header,
}: {
  children: React.ReactNode
  header?: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10 sm:py-12">
      {header ? <div className="mb-4">{header}</div> : null}

      <div className="flex flex-1 flex-col gap-10 sm:gap-12">{children}</div>

      <div className="pt-10 sm:pt-12">
        <SiteFooter />
      </div>
    </div>
  )
}
