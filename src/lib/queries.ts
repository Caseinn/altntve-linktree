import "server-only"
import { and, count, desc, eq } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"

import { BACKGROUND, BRAND, type LinkKind } from "@/config/brand"
import { db, SITE_ID, tables } from "@/db"

export const CACHE_TAGS = {
  links: "links",
  site: "site",
} as const

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

export const getSocialLinks = () => getLinksByKind("social")
export const getLinkRows = () => getLinksByKind("link")

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

export async function getLinkIdsByPosition(kind: LinkKind) {
  return db
    .select({ id: tables.links.id, position: tables.links.position })
    .from(tables.links)
    .where(eq(tables.links.kind, kind))
    .orderBy(tables.links.position)
}

export async function getNextPosition(kind: LinkKind) {
  const rows = await db
    .select({ position: tables.links.position })
    .from(tables.links)
    .where(eq(tables.links.kind, kind))
    .orderBy(desc(tables.links.position))
    .limit(1)

  return (rows[0]?.position ?? -1) + 1
}

export async function slugExists(slug: string) {
  const rows = await db
    .select({ id: tables.links.id })
    .from(tables.links)
    .where(eq(tables.links.slug, slug))
    .limit(1)

  return rows.length > 0
}
