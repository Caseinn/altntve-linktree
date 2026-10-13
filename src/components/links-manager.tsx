"use client"

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { useActionState, useState } from "react"

import {
  type ActionState,
  createLink,
  deleteLink,
  moveLink,
  updateLink,
} from "@/app/actions"
import { FormError } from "@/components/form-error"
import { LinkFields } from "@/components/link-fields"
import { LinkIcon } from "@/components/link-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LINK_KIND_LABELS, LINK_KINDS, type LinkKind } from "@/config/brand"

type LinkRow = {
  clicks: number
  icon: null | string
  id: string
  isVisible: boolean
  kind: LinkKind
  note: null | string
  slug: string
  title: string
  url: string
}

export function LinksManager({ links }: { links: LinkRow[] }) {
  const [createState, createAction, creating] = useActionState<
    ActionState,
    FormData
  >(createLink, {})

  return (
    <div className="flex flex-col gap-10">
      <CreateLinkDialog
        action={createAction}
        pending={creating}
        state={createState}
      />

      {links.length === 0 ? (
        <p className="text-sm text-neutral-500">No Links Yet</p>
      ) : null}

      {LINK_KINDS.map((kind) => {
        const group = links.filter((link) => link.kind === kind)

        if (group.length === 0) return null

        return (
          <section className="flex flex-col gap-3" key={kind}>
            <h2 className="editorial text-neutral-500">
              {LINK_KIND_LABELS[kind]}
            </h2>

            <ul className="border-t border-foreground/15">
              {group.map((link, index) => (
                <li
                  className="flex items-center gap-4 border-b border-foreground/15 py-4"
                  key={link.id}
                >
                  <div className="flex min-w-0 flex-col gap-1 md:w-72 md:flex-row md:items-center md:gap-4">
                    <span className="flex items-center gap-2">
                      <LinkIcon
                        className="size-4 shrink-0 text-neutral-500"
                        icon={link.icon}
                      />
                      <span className="text-sm font-medium">{link.title}</span>
                    </span>
                    <span className="truncate text-xs text-neutral-500">
                      /l/{link.slug}
                    </span>
                  </div>

                  <span className="flex items-center gap-3">
                    {!link.isVisible ? (
                      <span className="editorial text-neutral-400">Hidden</span>
                    ) : null}
                    <span className="text-xs text-neutral-500 tabular-nums">
                      {link.clicks} Clicks
                    </span>
                  </span>

                  <LinkRowActions
                    isFirst={index === 0}
                    isLast={index === group.length - 1}
                    link={link}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function CreateLinkDialog({
  action,
  pending,
  state,
}: {
  action: (formData: FormData) => void
  pending: boolean
  state: ActionState
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus aria-hidden className="size-3.5" />
          New Link
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base brand">New Link</DialogTitle>
          <DialogDescription>
            Slug Is Derived From The Title Unless You Set One.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          <FormError state={state} />

          <LinkFields defaults={{ kind: "social" }} idPrefix="new" showSlug />

          <Button disabled={pending} type="submit">
            {pending ? "Creating..." : "Create Link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteLinkButton({ link }: { link: LinkRow }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deleteLink,
    {},
  )
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          aria-label={`Delete ${link.title}`}
          size="icon-xs"
          variant="ghost"
        >
          <Trash2 aria-hidden className="size-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base brand">Delete Link</DialogTitle>
          <DialogDescription>
            &ldquo;{link.title}&rdquo; and its click history will be removed.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-3">
          <input name="id" type="hidden" value={link.id} />

          <FormError state={state} />

          <div className="flex gap-2">
            <Button disabled={pending} type="submit" variant="destructive">
              {pending ? "Deleting..." : "Delete"}
            </Button>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditLinkDialog({ link }: { link: LinkRow }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateLink,
    {},
  )
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="xs" variant="ghost">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base brand">Edit Link</DialogTitle>
          <DialogDescription>/l/{link.slug}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input name="id" type="hidden" value={link.id} />

          <FormError state={state} />

          <LinkFields
            defaults={{
              icon: link.icon,
              kind: link.kind,
              note: link.note ?? "",
              title: link.title,
              url: link.url,
            }}
            idPrefix={link.id}
            showSlug={false}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              className="size-4 accent-neutral-900"
              defaultChecked={link.isVisible}
              name="isVisible"
              type="checkbox"
            />
            Visible on public page
          </label>

          <Button disabled={pending} type="submit">
            {pending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LinkRowActions({
  isFirst,
  isLast,
  link,
}: {
  isFirst: boolean
  isLast: boolean
  link: LinkRow
}) {
  return (
    <div className="ml-auto flex items-center gap-1">
      <MoveButton
        direction="up"
        disabled={isFirst}
        id={link.id}
        kind={link.kind}
        title={link.title}
      />
      <MoveButton
        direction="down"
        disabled={isLast}
        id={link.id}
        kind={link.kind}
        title={link.title}
      />
      <EditLinkDialog link={link} />
      <DeleteLinkButton link={link} />
    </div>
  )
}

function MoveButton({
  direction,
  disabled,
  id,
  kind,
  title,
}: {
  direction: "down" | "up"
  disabled: boolean
  id: string
  kind: LinkKind
  title: string
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    moveLink,
    {},
  )

  return (
    <form action={formAction}>
      <input name="id" type="hidden" value={id} />
      <input name="kind" type="hidden" value={kind} />
      <input name="direction" type="hidden" value={direction} />
      <Button
        aria-label={`Move ${title} ${direction}`}
        disabled={disabled}
        size="icon-xs"
        title={state.error}
        type="submit"
        variant="ghost"
      >
        {direction === "up" ? (
          <ArrowUp aria-hidden className="size-3.5" />
        ) : (
          <ArrowDown aria-hidden className="size-3.5" />
        )}
      </Button>
    </form>
  )
}
