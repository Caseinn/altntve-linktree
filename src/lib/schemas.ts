import * as z from "zod"

import { BACKGROUND, LINK_KINDS } from "@/config/brand"
import { isIconKey } from "@/lib/icons"
import { ALLOWED_LINK_PROTOCOLS } from "@/lib/url"

function parseUrl(value: string) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

/**
 * Prefixes a scheme-less host so admins can paste `instagram.com/altntve`.
 *
 * Anything that already carries a real scheme is left untouched, so the protocol
 * check below can reject it by name instead of this silently rewriting it into a
 * URL that resolves somewhere else entirely. `mailto:` has no `//`, hence the
 * second pattern.
 *
 * `localhost:3000` is deliberately *not* treated as a scheme: it has no `//` and
 * is not `mailto:`, so it still becomes `https://localhost:3000` as before.
 */
function withProtocol(value: string) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) || /^mailto:/i.test(value)
    ? value
    : `https://${value}`
}

const requiredText = (message: string) => z.string().trim().min(1, message)

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null)

const urlField = z
  .string()
  .trim()
  .min(1, "URL is required")
  .transform(withProtocol)
  .refine((value) => parseUrl(value) !== null, "That is not a valid URL")
  .refine((value) => {
    const url = parseUrl(value)
    return url !== null && ALLOWED_LINK_PROTOCOLS.has(url.protocol)
  }, "Links must be http, https, or mailto")

const iconField = z
  .string()
  .trim()
  .transform((value) => (value === "" || value === "none" ? null : value))
  .refine((value) => value === null || isIconKey(value), "Unknown icon")

/**
 * Reads an HTML checkbox value.
 *
 * `z.coerce.boolean()` is truthiness-based, so it would turn the strings
 * `"false"`, `"0"` and `"off"` into `true`. A bare checkbox only ever sends
 * `"on"` or nothing, which is why the coercion happened to work; being explicit
 * keeps it correct if the field ever gains a hidden companion input.
 */
const checkbox = z.preprocess(
  (value) =>
    value === undefined || value === null || value === "" || value === "false"
      ? false
      : Boolean(value),
  z.boolean(),
)

const sharedLinkFields = {
  icon: iconField,
  title: requiredText("Title is required"),
  url: urlField,
}

const socialVariant = z.object({
  ...sharedLinkFields,
  kind: z.literal("social"),
})

const linkRowVariant = z.object({
  ...sharedLinkFields,
  kind: z.literal("link"),
  note: optionalText,
})

/**
 * Creation payload.
 *
 * A union on `kind` because a note is only accepted on a link row, so the
 * schema also tells the caller which branch it matched.
 */
export const createLinkSchema = z.discriminatedUnion("kind", [
  socialVariant,
  linkRowVariant,
])

/** Edit payload: creation plus the id and visibility the dashboard submits. */
export const updateLinkSchema = z.discriminatedUnion("kind", [
  socialVariant.extend({ id: z.uuid("Missing link id"), isVisible: checkbox }),
  linkRowVariant.extend({ id: z.uuid("Missing link id"), isVisible: checkbox }),
])

/** Delete payload: the link's id and nothing else. */
export const deleteLinkSchema = z.object({
  id: z.uuid("Missing link id"),
})

/** Reorder payload; `kind` scopes the swap to the group the row sits in. */
export const moveLinkSchema = z.object({
  direction: z.enum(["up", "down"], "Unknown direction"),
  id: z.uuid("Missing link id"),
  kind: z.enum(LINK_KINDS, "Unknown kind"),
})

/**
 * Defaults on absent input as well as blank, because `formDataToRecord` omits
 * any key the caller forgot to list and coercing `undefined` would surface as
 * an unusable "received NaN".
 */
const backgroundOpacityField = z.preprocess(
  (value) =>
    value === undefined || value === null || value === ""
      ? BACKGROUND.defaultOpacity
      : value,
  z.coerce
    .number()
    .int("Background opacity must be a whole number")
    .min(0, "Background opacity cannot be negative")
    .max(
      BACKGROUND.maxOpacity,
      `Background opacity cannot exceed ${BACKGROUND.maxOpacity}%`,
    ),
)

/** Profile payload. Optional text is normalised to `null` rather than `""`. */
export const siteSchema = z.object({
  backgroundOpacity: backgroundOpacityField,
  bio: optionalText,
  displayName: requiredText("Display name is required"),
  email: z
    .union([z.literal(""), z.email("That is not a valid email")])
    .transform((value) => value || null),
  location: optionalText,
  tagline: z.string().trim(),
})

/** Sign-in credentials. */
export const signInSchema = z.object({
  email: z.email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
})

/**
 * Renders a failed parse as the single line an admin reads.
 *
 * @param error - From a `safeParse` that did not succeed.
 * @returns A message fit for a form error slot.
 */
export function firstError(error: z.ZodError) {
  return z.prettifyError(error)
}

/**
 * Projects a submission down to the fields a schema cares about.
 *
 * An omitted key becomes `null` rather than disappearing, so "not submitted" and
 * "submitted empty" stay distinguishable to a schema that defaults on absence.
 *
 * @param formData - Raw submission.
 * @param keys - Fields the caller intends to validate.
 */
export function formDataToRecord(formData: FormData, keys: readonly string[]) {
  return Object.fromEntries(
    keys.map((key) => [key, formData.get(key) as null | string]),
  )
}
