"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef, useState } from "react"

import { type ActionState, updateSite } from "@/app/actions"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type SiteDefaults = {
  avatarUrl: string
  bio: string
  displayName: string
  email: string
  location: string
  tagline: string
}

/**
 * Admin editor for the single site profile.
 *
 * The avatar field previews the picked file through a local object URL and
 * skips the optimizer, since a blob URL cannot be fetched server-side and the
 * stored remote URL should render even while it is being replaced.
 */
export function SiteForm({ defaults }: { defaults: SiteDefaults }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateSite,
    {},
  )
  const [picked, setPicked] = useState<null | string>(null)
  const objectUrl = useRef<null | string>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const removeInput = useRef<HTMLInputElement>(null)
  const handled = useRef<unknown>(null)

  useEffect(() => {
    if (!state.saved || handled.current === state) return
    handled.current = state

    setPicked(null)
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = null
    if (fileInput.current) fileInput.current.value = ""
    router.refresh()
  }, [router, state])

  function pick(event: React.ChangeEvent<HTMLInputElement>) {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)

    const file = event.currentTarget.files?.[0]
    objectUrl.current = file ? URL.createObjectURL(file) : null
    setPicked(objectUrl.current)

    if (file && removeInput.current) removeInput.current.checked = false
  }

  const preview = picked ?? defaults.avatarUrl

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      <FormError state={state} />

      <Field
        hint="Square crop, 5 MB max. Metadata is stripped on upload."
        id="avatar"
        label="Avatar"
      >
        {preview ? (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-1 ring-foreground/10">
            <Image
              alt="Avatar preview"
              className="object-cover"
              fill
              sizes="80px"
              src={preview}
              unoptimized
            />
          </div>
        ) : null}

        <Input
          accept="image/jpeg,image/png,image/webp"
          className="cursor-pointer file:cursor-pointer"
          id="avatar"
          name="avatar"
          onChange={pick}
          ref={fileInput}
          type="file"
        />

        {defaults.avatarUrl ? (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              className="cursor-pointer"
              name="removeAvatar"
              ref={removeInput}
              type="checkbox"
            />
            Remove current avatar
          </label>
        ) : null}
      </Field>

      <Field id="displayName" label="Display Name">
        <Input
          defaultValue={defaults.displayName}
          id="displayName"
          name="displayName"
          required
        />
      </Field>

      <Field id="tagline" label="Tagline">
        <Input defaultValue={defaults.tagline} id="tagline" name="tagline" />
      </Field>

      <Field id="bio" label="Bio">
        <Textarea defaultValue={defaults.bio} id="bio" name="bio" rows={4} />
      </Field>

      <Field id="location" label="Location">
        <Input defaultValue={defaults.location} id="location" name="location" />
      </Field>

      <Field id="email" label="Contact Email">
        <Input
          defaultValue={defaults.email}
          id="email"
          name="email"
          type="email"
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button disabled={pending} type="submit">
          {pending ? "Saving..." : "Save Changes"}
        </Button>
        {state.saved ? (
          <span className="text-xs text-muted-foreground" role="status">
            Saved
          </span>
        ) : null}
      </div>
    </form>
  )
}

function Field({
  children,
  hint,
  id,
  label,
}: {
  children: React.ReactNode
  hint?: string
  id: string
  label: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="editorial text-neutral-500" htmlFor={id}>
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
