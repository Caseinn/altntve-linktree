import { BrandHeader } from "@/components/brand-header"
import { LoginForm } from "@/components/login-form"
import { PageShell } from "@/components/page-shell"

export const metadata = { title: "Sign In" }

export default function Page() {
  return (
    <PageShell header={<BrandHeader />}>
      <section className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center sm:gap-8">
        <h1 className="editorial text-neutral-500">Dashboard Access</h1>

        <div className="w-full max-w-xs">
          <LoginForm />
        </div>
      </section>
    </PageShell>
  )
}
