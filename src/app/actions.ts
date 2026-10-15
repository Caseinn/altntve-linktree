"use server"

import { eq } from "drizzle-orm"
import { revalidatePath, updateTag } from "next/cache"
import { redirect } from "next/navigation"

import { db, isUniqueViolation, SITE_ID, tables } from "@/db"
import { isAdminEmail, requireAdmin } from "@/lib/auth"
import { removeAvatar, storeAvatar } from "@/lib/avatar"
import { removeBackground, storeBackground } from "@/lib/background"
import {
  CACHE_TAGS,
  getLinkIdsByPosition,
  getNextPosition,
  slugExists,
} from "@/lib/queries"
import { slugify } from "@/lib/routes"
import {
  createLinkSchema,
  deleteLinkSchema,
  firstError,
  formDataToRecord,
  moveLinkSchema,
  signInSchema,
  siteSchema,
  updateLinkSchema,
} from "@/lib/schemas"
import { createClient } from "@/lib/supabase/server"
import { assertUploadable, UploadError } from "@/lib/upload"

/** Result shape every action returns, for `useActionState`. */
export type ActionState = {
  error?: string
  saved?: boolean
}

const OK: ActionState = { saved: true }

type BackgroundUrls = { avifUrl: string; webpUrl: string }

/** Intent derived from one image field in a profile submission. */
type ImageChange<T> =
  | { kind: "error"; message: string }
  | { kind: "keep" }
  | { kind: "remove" }
  | { kind: "replace"; value: T }

/** One file field and the checkbox that retires it. */
type ImageField<T> = {
  /** Form field carrying the new file. */
  field: string
  /** Removes whatever is currently stored. */
  remove: () => Promise<void>
  /** Checkbox field carrying the removal intent. */
  removeFlag: string
  /** Re-encodes and stores a picked file, returning what the site row should hold. */
  upload: (file: File) => Promise<T>
}

const AVATAR_FIELD: ImageField<string> = {
  field: "avatar",
  remove: removeAvatar,
  removeFlag: "removeAvatar",
  upload: storeAvatar,
}

const BACKGROUND_FIELD: ImageField<BackgroundUrls> = {
  field: "background",
  remove: removeBackground,
  removeFlag: "removeBackground",
  upload: storeBackground,
}

/**
 * Every file the profile form can carry, screened before anything is written.
 *
 * `updateSite` stores the avatar and the background from one submission, and
 * each store call upserts over a fixed object key. Validating up front means a
 * bad file in the second field cannot strand the first field's bytes in the
 * bucket, or replace the live object behind a row that never got updated.
 */
const UPLOAD_FIELDS = [
  { field: "avatar", label: "Avatar" },
  { field: "background", label: "Background" },
] as const

/**
 * Adds a link, deriving its slug from the title.
 *
 * The slug is fixed at creation and never rewritten, so the check and the insert
 * cannot both be trusted: `links_slug_key` is the real arbiter.
 */
export async function createLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin()

  const parsed = createLinkSchema.safeParse(
    formDataToRecord(formData, ["title", "url", "note", "icon", "kind"]),
  )

  if (!parsed.success) return { error: firstError(parsed.error) }

  const { icon, kind, title, url } = parsed.data
  const note = "note" in parsed.data ? parsed.data.note : null
  const finalSlug = slugify(title)

  if (!finalSlug) return { error: "Could not derive a slug from that title" }

  const slugTaken = `Slug "${finalSlug}" is already taken`

  if (await slugExists(finalSlug)) {
    return { error: slugTaken }
  }

  try {
    await db.insert(tables.links).values({
      icon,
      kind,
      note: kind === "link" ? note : null,
      position: await getNextPosition(kind),
      slug: finalSlug,
      title,
      url,
    })
  } catch (error) {
    if (isUniqueViolation(error)) return { error: slugTaken }
    throw error
  }

  invalidateLinks()
  return OK
}

/** Removes a link; its click history cascades away with it. */
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

/** Swaps a link's position with its neighbour in the same kind. */
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

/**
 * Signs in with a password, then signs out again unless the address is an admin.
 *
 * Signing out rather than erroring keeps a valid non-admin session from lingering
 * on a page that will only reject it.
 */
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

/** Ends the session and returns to the login page. */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

/**
 * Edits a link in place.
 *
 * Changing `kind` moves the link to the end of its new group, because positions
 * are only ever compared within one kind.
 */
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
 * Saves the single site profile, applying the avatar and background uploads or
 * removals that came with the same submission.
 *
 * Upserts so the profile works before the row has ever been created, since it is
 * seeded from `BRAND` defaults rather than by a migration.
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
      "backgroundOpacity",
    ]),
  )

  if (!parsed.success) return { error: firstError(parsed.error) }

  for (const { field, label } of UPLOAD_FIELDS) {
    const file = formData.get(field)
    if (!(file instanceof File) || file.size === 0) continue

    try {
      assertUploadable(file, label)
    } catch (error) {
      if (error instanceof UploadError) return { error: error.message }
      throw error
    }
  }

  const change = await resolveImageChange(formData, AVATAR_FIELD)
  if (change.kind === "error") return { error: change.message }

  const backgroundChange = await resolveImageChange(formData, BACKGROUND_FIELD)
  if (backgroundChange.kind === "error")
    return { error: backgroundChange.message }

  const [current] = await db
    .select({
      avatarUrl: tables.site.avatarUrl,
      backgroundAvifUrl: tables.site.backgroundAvifUrl,
      backgroundWebpUrl: tables.site.backgroundWebpUrl,
    })
    .from(tables.site)
    .where(eq(tables.site.id, SITE_ID))
    .limit(1)

  const avatarUrl =
    change.kind === "replace"
      ? change.value
      : change.kind === "remove"
        ? null
        : (current?.avatarUrl ?? null)

  const background =
    backgroundChange.kind === "remove"
      ? { avifUrl: null, webpUrl: null }
      : backgroundChange.kind === "replace"
        ? backgroundChange.value
        : {
            avifUrl: current?.backgroundAvifUrl ?? null,
            webpUrl: current?.backgroundWebpUrl ?? null,
          }

  const values = {
    ...parsed.data,
    avatarUrl,
    backgroundAvifUrl: background.avifUrl,
    backgroundWebpUrl: background.webpUrl,
  }

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
 * Works out what should happen to one stored image for this submission.
 *
 * A freshly picked file wins over a checked "remove" box, so a stale checkbox
 * can never silently discard an upload the admin just made.
 *
 * @param formData - Raw submission from the profile form.
 * @param config - The field and checkbox that drive this image.
 * @returns The change to persist, or a message to show the admin.
 * @throws Anything that is not an `UploadError`; that is an unexpected fault.
 */
async function resolveImageChange<T>(
  formData: FormData,
  { field, remove, removeFlag, upload }: ImageField<T>,
): Promise<ImageChange<T>> {
  const file = formData.get(field)

  if (file instanceof File && file.size > 0) {
    try {
      return { kind: "replace", value: await upload(file) }
    } catch (error) {
      if (error instanceof UploadError) {
        return { kind: "error", message: error.message }
      }
      throw error
    }
  }

  if (formData.get(removeFlag) === "on") {
    await remove()
    return { kind: "remove" }
  }

  return { kind: "keep" }
}
