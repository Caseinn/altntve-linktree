import { after, type NextRequest, NextResponse } from "next/server"

import { db, tables } from "@/db"
import { getLinkBySlug } from "@/lib/queries"
import { ALLOWED_LINK_PROTOCOLS } from "@/lib/url"

const NOT_FOUND_STATUS = 404

/**
 * Redirects a slug to its target and records the click.
 *
 * The click insert runs in `after`, so a storage or network hiccup there cannot
 * cost the visitor their redirect.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const link = await getLinkBySlug(slug)

  if (!link) {
    return NextResponse.json(
      { error: "Link Not Found" },
      { status: NOT_FOUND_STATUS },
    )
  }

  const { id: linkId, isVisible, url } = link

  if (!isVisible) {
    return NextResponse.json(
      { error: "Link not found" },
      { status: NOT_FOUND_STATUS },
    )
  }

  let target: URL

  try {
    target = resolveTarget(url, request.url)
  } catch {
    return NextResponse.json(
      { error: "Link target is invalid" },
      { status: NOT_FOUND_STATUS },
    )
  }

  const referer = request.headers.get("referer")

  after(async () => {
    try {
      await db.insert(tables.clicks).values({ linkId, referer })
    } catch (error) {
      console.error("Failed to record click", { error, linkId })
    }
  })

  return NextResponse.redirect(target, 302)
}

function resolveTarget(url: string, origin: string) {
  const target = new URL(url, origin)

  if (!ALLOWED_LINK_PROTOCOLS.has(target.protocol)) {
    throw new Error(`Unsupported link protocol: ${target.protocol}`)
  }

  return target
}
