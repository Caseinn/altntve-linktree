"use client"

import { useState } from "react"

import { IconPicker } from "@/components/icon-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LINK_KIND_LABELS, LINK_KINDS, type LinkKind } from "@/config/brand"

type LinkFieldValues = {
  icon: null | string
  kind: LinkKind
  note: string
  slug: string
  title: string
  url: string
}

export function LinkFields({
  defaults,
  idPrefix,
  showSlug,
}: {
  defaults?: Partial<LinkFieldValues>
  idPrefix: string
  showSlug: boolean
}) {
  const id = (name: string) => `${idPrefix}-${name}`
  const [kind, setKind] = useState<LinkKind>(defaults?.kind ?? "social")
  const showNote = kind === "link"

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 editorial text-neutral-500">Tampil Di</legend>

        <div className="flex gap-2">
          {LINK_KINDS.map((option) => (
            <label
              className="flex-1 cursor-pointer border border-foreground/15 px-3 py-2 text-xs transition-colors has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:ring-1 has-focus-visible:ring-foreground has-focus-visible:ring-offset-1 has-focus-visible:ring-offset-background"
              htmlFor={`${id("kind")}-${option}`}
              key={option}
            >
              <input
                checked={option === kind}
                className="sr-only"
                id={`${id("kind")}-${option}`}
                name="kind"
                onChange={() => setKind(option)}
                type="radio"
                value={option}
              />
              {LINK_KIND_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("title")}>Title</Label>
        <Input
          defaultValue={defaults?.title}
          id={id("title")}
          name="title"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("url")}>URL</Label>
        <Input
          defaultValue={defaults?.url}
          id={id("url")}
          name="url"
          placeholder="instagram.com/altntve"
          required
        />
      </div>

      {showSlug ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("slug")}>Slug</Label>
          <Input
            defaultValue={defaults?.slug}
            id={id("slug")}
            name="slug"
            placeholder="Derived From Title"
          />
        </div>
      ) : null}

      {showNote ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("note")}>Note</Label>
          <Input
            defaultValue={defaults?.note}
            id={id("note")}
            name="note"
            placeholder="Optional Supporting Text"
          />
        </div>
      ) : null}

      <IconPicker defaultValue={defaults?.icon} id={id("icon")} />
    </div>
  )
}
