import * as z from "zod"

import { LINK_KINDS } from "@/config/brand"
import { isIconKey } from "@/lib/icons"

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60)
    .replace(/^-+|-+$/g, "")
}

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function withProtocol(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
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
  .refine(isValidUrl, "That is not a valid URL")

const iconField = z
  .string()
  .trim()
  .transform((value) => (value === "" || value === "none" ? null : value))
  .refine((value) => value === null || isIconKey(value), "Unknown icon")

const checkbox = z.coerce.boolean()

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

export const createLinkSchema = z.discriminatedUnion("kind", [
  socialVariant.extend({ slug: z.string().trim() }),
  linkRowVariant.extend({ slug: z.string().trim() }),
])

export const updateLinkSchema = z.discriminatedUnion("kind", [
  socialVariant.extend({ id: z.uuid("Missing link id"), isVisible: checkbox }),
  linkRowVariant.extend({ id: z.uuid("Missing link id"), isVisible: checkbox }),
])

export const deleteLinkSchema = z.object({
  id: z.uuid("Missing link id"),
})

export const moveLinkSchema = z.object({
  direction: z.enum(["up", "down"], "Unknown direction"),
  id: z.uuid("Missing link id"),
  kind: z.enum(LINK_KINDS, "Unknown kind"),
})

export const siteSchema = z.object({
  bio: optionalText,
  displayName: requiredText("Display name is required"),
  email: z
    .union([z.literal(""), z.email("That is not a valid email")])
    .transform((value) => value || null),
  location: optionalText,
  tagline: z.string().trim(),
})

export const signInSchema = z.object({
  email: z.email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
})

export function firstError(error: z.ZodError) {
  return z.prettifyError(error)
}

export function formDataToRecord(formData: FormData, keys: readonly string[]) {
  return Object.fromEntries(
    keys.map((key) => [key, formData.get(key) as null | string]),
  )
}
