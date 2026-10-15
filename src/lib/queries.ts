import "server-only"
import { and, count, desc, eq } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"

import { BACKGROUND, BRAND, type LinkKind } from "@/config/brand"
import { db, SITE_ID, tables } from "@/db"

/** Cache tags shared by every query and by the actions that invalidate them. */
export const CACHE_TAGS = {
  links: "links",
  site: "site",
} as const

/**
 * Reads the single site profile.
 *
 * Falls back to brand defaults when the row does not exist yet, so the public
 * page renders before anyone has ever opened the dashboard.
 */
export async function getSite() {
  "use cache"
  cacheLife("hours")
  cacheTag(CACHE_TAGS.site)

  const rows = await db
    .select()
    .from(tables.site)
    .where(eq(tables.site.id, SITE_ID))
    .limit(1)

  return (
    rows[0] ?? {
      avatarUrl: null,
      backgroundAvifUrl: null,
      backgroundOpacity: BACKGROUND.defaultOpacity,
      backgroundWebpUrl: null,
      bio: null,
      displayName: BRAND.name,
      email: null,
      location: null,
      tagline: BRAND.tagline,
    }
  )
}

const linkCardColumns = {
  icon: tables.links.icon,
  id: tables.links.id,
  note: tables.links.note,
  position: tables.links.position,
  slug: tables.links.slug,
  title: tables.links.title,
}

async function getLinksByKind(kind: LinkKind) {
  "use cache"
  cacheLife("hours")
  cacheTag(CACHE_TAGS.links)

  return db
    .select(linkCardColumns)
    .from(tables.links)
    .where(and(eq(tables.links.kind, kind), eq(tables.links.isVisible, true)))
    .orderBy(tables.links.position)
}

/** Visible social links, for the icon row on the public page. */
export const getSocialLinks = () => getLinksByKind("social")

/** Visible link rows, for the list on the public page. */
export const getLinkRows = () => getLinksByKind("link")

/**
 * Every link with its click count, for the dashboard.
 *
 * Includes hidden links because the dashboard has to be able to unhide them.
 */
export async function getAllLinks() {
  "use cache"
  cacheLife("max")
  cacheTag(CACHE_TAGS.links)

  return db
    .select({
      clicks: count(tables.clicks.id),
      icon: tables.links.icon,
      id: tables.links.id,
      isVisible: tables.links.isVisible,
      kind: tables.links.kind,
      note: tables.links.note,
      position: tables.links.position,
      slug: tables.links.slug,
      title: tables.links.title,
      url: tables.links.url,
    })
    .from(tables.links)
    .leftJoin(tables.clicks, eq(tables.clicks.linkId, tables.links.id))
    .groupBy(tables.links.id)
    .orderBy(tables.links.kind, tables.links.position)
}

/**
 * Reads one link for the redirect handler.
 *
 * Deliberately uncached: the route records a click on every hit and must never
 * serve a stale `isVisible`.
 *
 * @param slug - Slug from the request path.
 * @returns The link, or `null` when no slug matches.
 */
export async function getLinkBySlug(slug: string) {
  const rows = await db
    .select({
      id: tables.links.id,
      isVisible: tables.links.isVisible,
      url: tables.links.url,
    })
    .from(tables.links)
    .where(eq(tables.links.slug, slug))
    .limit(1)

  return rows[0] ?? null
}

/**
 * Ordered ids and positions for one kind, hidden links included.
 *
 * The reorder action swaps against this list, so it must match the order the
 * dashboard renders.
 */
export async function getLinkIdsByPosition(kind: LinkKind) {
  return db
    .select({ id: tables.links.id, position: tables.links.position })
    .from(tables.links)
    .where(eq(tables.links.kind, kind))
    .orderBy(tables.links.position)
}

/** Next free position within one kind, so a new link lands last. */
export async function getNextPosition(kind: LinkKind) {
  const rows = await db
    .select({ position: tables.links.position })
    .from(tables.links)
    .where(eq(tables.links.kind, kind))
    .orderBy(desc(tables.links.position))
    .limit(1)

  return (rows[0]?.position ?? -1) + 1
}

/**
 * Whether a slug is already taken.
 *
 * Advisory only: the unique index is what actually prevents a collision.
 */
export async function slugExists(slug: string) {
  const rows = await db
    .select({ id: tables.links.id })
    .from(tables.links)
    .where(eq(tables.links.slug, slug))
    .limit(1)

  return rows.length > 0
}
