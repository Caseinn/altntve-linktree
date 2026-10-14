"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useActionState, useCallback, useEffect, useRef, useState } from "react"

import { type ActionState, updateSite } from "@/app/actions"
import { BackgroundPreview } from "@/components/background-preview"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BACKGROUND } from "@/config/brand"
import { cropToPlate } from "@/lib/plate"

type SiteDefaults = {
  avatarUrl: string
  backgroundAvifUrl: string
  backgroundOpacity: number
  backgroundWebpUrl: string
  bio: string
  displayName: string
  email: string
  location: string
  tagline: string
}

/** Avatar previews are shown uncropped, exactly as uploaded. */
const identity = async (file: File) => file

/**
 * Admin editor for the single site profile.
 *
 * Image previews come from local object URLs and skip the optimizer, because a
 * blob URL cannot be fetched server-side and the stored URL should stay visible
 * while it is being replaced.
 *
 * @param props - Current stored values, used as uncontrolled defaults.
 */
export function SiteForm({ defaults }: { defaults: SiteDefaults }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateSite,
    {},
  )
  const [opacity, setOpacity] = useState(defaults.backgroundOpacity)
  const [storedOpacity, setStoredOpacity] = useState(defaults.backgroundOpacity)
  const avatarFile = useRef<HTMLInputElement>(null)
  const avatarRemove = useRef<HTMLInputElement>(null)
  const backgroundFile = useRef<HTMLInputElement>(null)
  const backgroundRemove = useRef<HTMLInputElement>(null)
  const avatar = useImageField(defaults.avatarUrl)
  const background = useImageField(
    defaults.backgroundWebpUrl || "/background.webp",
    cropToPlate,
  )
  const { clear: clearAvatar } = avatar
  const { clear: clearBackground } = background
  const handled = useRef<unknown>(null)

  useEffect(() => {
    if (!state.saved || handled.current === state) return
    handled.current = state

    clearAvatar()
    clearBackground()
    if (avatarFile.current) avatarFile.current.value = ""
    if (backgroundFile.current) backgroundFile.current.value = ""
    router.refresh()
  }, [avatarFile, backgroundFile, clearAvatar, clearBackground, router, state])

  if (storedOpacity !== defaults.backgroundOpacity) {
    setStoredOpacity(defaults.backgroundOpacity)
    setOpacity(defaults.backgroundOpacity)
  }

  const backgroundAvifUrl = defaults.backgroundWebpUrl
    ? defaults.backgroundAvifUrl || "/background.avif"
    : "/background.avif"

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      <FormError state={state} />

      <Field
        hint="Square crop, 5 MB max. Metadata is stripped on upload."
        id="avatar"
        label="Avatar"
      >
        {avatar.preview ? (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-1 ring-foreground/10">
            <Image
              alt="Avatar preview"
              className="object-cover"
              fill
              sizes="80px"
              src={avatar.preview}
              unoptimized
            />
          </div>
        ) : null}

        <Input
          accept="image/jpeg,image/png,image/webp"
          className="max-w-full cursor-pointer file:cursor-pointer"
          id="avatar"
          name="avatar"
          onChange={(event) => pickFile(event, avatarRemove, avatar.pick)}
          ref={avatarFile}
          type="file"
        />

        {defaults.avatarUrl ? (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              className="cursor-pointer"
              name="removeAvatar"
              ref={avatarRemove}
              type="checkbox"
            />
            Remove current avatar
          </label>
        ) : null}
      </Field>

      <Field
        hint={`Any aspect ratio, 5 MB max. Centre-cropped to ${BACKGROUND.width}×${BACKGROUND.height}, then stored as AVIF with a WebP fallback.`}
        id="background"
        label="Background"
      >
        <Input
          accept="image/jpeg,image/png,image/webp"
          className="max-w-full cursor-pointer file:cursor-pointer"
          id="background"
          name="background"
          onChange={(event) =>
            pickFile(event, backgroundRemove, background.pick)
          }
          ref={backgroundFile}
          type="file"
        />

        <BackgroundPreview
          avifUrl={background.picked ? null : backgroundAvifUrl}
          opacity={opacity}
          webpUrl={background.preview}
        />

        {background.preparing ? (
          <p className="text-xs text-muted-foreground">Cropping preview...</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Label className="text-xs text-muted-foreground" htmlFor="opacity">
            Opacity
          </Label>

          <input
            className="w-full min-w-32 flex-1 accent-neutral-900 sm:w-40 sm:flex-none"
            id="opacity"
            max={BACKGROUND.maxOpacity}
            min={0}
            name="backgroundOpacity"
            onChange={(event) => setOpacity(Number(event.currentTarget.value))}
            type="range"
            value={opacity}
          />

          <span className="text-xs text-muted-foreground tabular-nums">
            {opacity}%
          </span>
        </div>

        {defaults.backgroundWebpUrl ? (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              className="cursor-pointer"
              name="removeBackground"
              ref={backgroundRemove}
              type="checkbox"
            />
            Remove current background
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

/**
 * Clears a "remove" checkbox when a replacement file is chosen, so the form
 * shows what will actually be stored.
 *
 * @param event - The change event from the file input.
 * @param remove - The checkbox paired with that field.
 * @param apply - The field's own change handler.
 */
function pickFile(
  event: React.ChangeEvent<HTMLInputElement>,
  remove: React.RefObject<HTMLInputElement | null>,
  apply: (event: React.ChangeEvent<HTMLInputElement>) => void,
) {
  if (remove.current && event.currentTarget.files?.length) {
    remove.current.checked = false
  }

  apply(event)
}

/**
 * Tracks one file field's local preview.
 *
 * `prepare` runs before the preview is shown, letting the background field crop
 * in the browser the way the server will. Picks carry a token because that step
 * is async, and a slow first crop must not overwrite a fast second one. The
 * hook owns no ref: the compiler forbids mutating a ref passed in as an
 * argument, so inputs and checkboxes belong to the caller.
 *
 * @param defaultUrl - Stored URL to show until a file is picked.
 * @param prepare - Optional transform applied to the picked file.
 */
function useImageField(
  defaultUrl: string,
  prepare: (file: File) => Promise<Blob> = identity,
) {
  const [picked, setPicked] = useState<null | string>(null)
  const [preparing, setPreparing] = useState(false)
  const objectUrl = useRef<null | string>(null)
  const latest = useRef(0)

  const clear = useCallback(() => {
    latest.current += 1
    setPicked(null)
    setPreparing(false)
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = null
  }, [])

  const pick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0]
      const token = (latest.current += 1)

      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
      objectUrl.current = null
      setPicked(null)

      if (!file) {
        setPreparing(false)
        return
      }

      setPreparing(true)

      void prepare(file)
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          if (token !== latest.current) {
            URL.revokeObjectURL(url)
            return
          }
          objectUrl.current = url
          setPicked(url)
          setPreparing(false)
        })
        .catch(() => {
          if (token === latest.current) setPreparing(false)
        })
    },
    [prepare],
  )

  return { clear, pick, picked, preparing, preview: picked ?? defaultUrl }
}
