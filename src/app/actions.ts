"use server"

import { eq } from "drizzle-orm"
import { revalidatePath, updateTag } from "next/cache"
import { redirect } from "next/navigation"

import { db, SITE_ID, tables } from "@/db"
import { isAdminEmail, requireAdmin } from "@/lib/auth"
import { AvatarError, removeAvatar, storeAvatar } from "@/lib/avatar"
import {
  CACHE_TAGS,
  getLinkIdsByPosition,
  getNextPosition,
  slugExists,
} from "@/lib/queries"
import {
  createLinkSchema,
  deleteLinkSchema,
  firstError,
  formDataToRecord,
  moveLinkSchema,
  signInSchema,
  siteSchema,
  slugify,
  updateLinkSchema,
} from "@/lib/schemas"
import { createClient } from "@/lib/supabase/server"

export type ActionState = {
  error?: string
  saved?: boolean
}

const OK: ActionState = { saved: true }

/** Avatar intent derived from one profile form submission. */
type AvatarChange =
  | { kind: "error"; message: string }
  | { kind: "keep" }
  | { kind: "remove" }
  | { kind: "replace"; url: string }

/**
 * Saves the single site profile, handling the avatar upload or removal that
 * came with the same submission.
 */
export async function createLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const parsed = createLinkSchema.safeParse(
    formDataToRecord(formData, [
      "title",
      "url",
      "slug",
      "note",
      "icon",
      "kind",
    ]),
  )

  if (!parsed.success) return { error: firstError(parsed.error) }

  const { icon, kind, slug, title, url } = parsed.data
  const note = "note" in parsed.data ? parsed.data.note : null
  const finalSlug = slugify(slug || title)

  if (!finalSlug) return { error: "Could not derive a slug from that title" }

  if (await slugExists(finalSlug)) {
    return { error: `Slug "${finalSlug}" is already taken` }
  }

  await db.insert(tables.links).values({
    icon,
    kind,
    note: kind === "link" ? note : null,
    position: await getNextPosition(kind),
    slug: finalSlug,
    title,
    url,
  })

  invalidateLinks()
  return OK
}

export async function deleteLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const parsed = deleteLinkSchema.safeParse(formDataToRecord(formData, ["id"]))
  if (!parsed.success) return { error: firstError(parsed.error) }

  await db.delete(tables.links).where(eq(tables.links.id, parsed.data.id))

  invalidateLinks()
  return OK
}

export async function moveLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const parsed = moveLinkSchema.safeParse(
    formDataToRecord(formData, ["id", "kind", "direction"]),
  )
  if (!parsed.success) return { error: firstError(parsed.error) }

  const { direction, id, kind } = parsed.data
  const rows = await getLinkIdsByPosition(kind)

  const index = rows.findIndex((row) => row.id === id)
  if (index === -1) return { error: "Link not found" }

  const swapWith = direction === "up" ? index - 1 : index + 1
  if (swapWith < 0 || swapWith >= rows.length) return OK

  const current = rows[index]
  const target = rows[swapWith]

  await db.transaction(async (tx) => {
    await tx
      .update(tables.links)
      .set({ position: target.position })
      .where(eq(tables.links.id, current.id))
    await tx
      .update(tables.links)
      .set({ position: current.position })
      .where(eq(tables.links.id, target.id))
  })

  invalidateLinks()
  return OK
}

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse(
    formDataToRecord(formData, ["email", "password"]),
  )

  if (!parsed.success) return { error: firstError(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: "Invalid email or password" }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) {
    await supabase.auth.signOut()
    return { error: "This account does not have dashboard access" }
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function updateLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const parsed = updateLinkSchema.safeParse(
    formDataToRecord(formData, [
      "id",
      "title",
      "url",
      "note",
      "icon",
      "kind",
      "isVisible",
    ]),
  )

  if (!parsed.success) return { error: firstError(parsed.error) }

  const { icon, id, isVisible, kind, title, url } = parsed.data
  const note = "note" in parsed.data ? parsed.data.note : null

  const current = await db
    .select({ kind: tables.links.kind })
    .from(tables.links)
    .where(eq(tables.links.id, id))
    .limit(1)

  const previousKind = current[0]?.kind

  const values = {
    icon,
    isVisible,
    kind,
    note: kind === "link" ? note : null,
    title,
    url,
    ...(previousKind && previousKind !== kind
      ? { position: await getNextPosition(kind) }
      : {}),
  }

  await db.update(tables.links).set(values).where(eq(tables.links.id, id))

  invalidateLinks()
  return OK
}

/**
 * Saves the single site profile, applying the avatar upload or removal that
 * came with the same submission.
 */
export async function updateSite(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const parsed = siteSchema.safeParse(
    formDataToRecord(formData, [
      "displayName",
      "tagline",
      "bio",
      "location",
      "email",
    ]),
  )

  if (!parsed.success) return { error: firstError(parsed.error) }

  const change = await resolveAvatar(formData)
  if (change.kind === "error") return { error: change.message }

  const [current] = await db
    .select({ avatarUrl: tables.site.avatarUrl })
    .from(tables.site)
    .where(eq(tables.site.id, SITE_ID))
    .limit(1)

  const avatarUrl =
    change.kind === "replace"
      ? change.url
      : change.kind === "remove"
        ? null
        : (current?.avatarUrl ?? null)

  const values = { ...parsed.data, avatarUrl }

  await db
    .insert(tables.site)
    .values(values)
    .onConflictDoUpdate({ set: values, target: tables.site.id })

  invalidateSite()
  return OK
}

function invalidateLinks() {
  updateTag(CACHE_TAGS.links)
  revalidatePath("/", "page")
}

function invalidateSite() {
  updateTag(CACHE_TAGS.site)
  revalidatePath("/", "page")
}

/**
 * Works out what should happen to the stored avatar for this submission.
 *
 * A freshly picked file wins over a checked "remove" box, so a stale checkbox
 * can never silently discard an upload the admin just made.
 *
 * @param formData - Raw submission from the profile form.
 * @returns The avatar change to persist, or a message to show the admin.
 */
async function resolveAvatar(formData: FormData): Promise<AvatarChange> {
  const file = formData.get("avatar")

  if (file instanceof File && file.size > 0) {
    try {
      return { kind: "replace", url: await storeAvatar(file) }
    } catch (error) {
      if (error instanceof AvatarError) {
        return { kind: "error", message: error.message }
      }
      throw error
    }
  }

  if (formData.get("removeAvatar") === "on") {
    await removeAvatar()
    return { kind: "remove" }
  }

  return { kind: "keep" }
}
