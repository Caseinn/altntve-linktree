import { getSite } from "@/lib/queries"

export async function Wordmark({ className }: { className?: string }) {
  const site = await getSite()

  return <span className={className}>{site.displayName}</span>
}
