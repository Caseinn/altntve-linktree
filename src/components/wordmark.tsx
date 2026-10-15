import { getSite } from "@/lib/queries"

/** The site name as a wordmark, so it follows the profile rather than the brand. */
export async function Wordmark({ className }: { className?: string }) {
  const site = await getSite()

  return <span className={className}>{site.displayName}</span>
}
