"use client"

import {
  ICON_KEYS,
  ICON_LABELS,
  ICON_REGISTRY,
  type IconKey,
  isIconKey,
} from "@/lib/icons"

/**
 * Radio grid for a link's icon, with `none` as an explicit choice.
 *
 * @param props - Current code and the id prefix keeping its inputs unique.
 */
export function IconPicker({
  defaultValue,
  id,
}: {
  defaultValue?: null | string
  id: string
}) {
  const initial: IconKey =
    defaultValue && isIconKey(defaultValue) ? defaultValue : "none"

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 editorial text-neutral-500">Icon</legend>

      <div className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto border border-foreground/15 p-2 sm:grid-cols-8">
        {ICON_KEYS.map((key) => {
          const Icon = ICON_REGISTRY[key]
          const idForInput = `${id}-${key}`

          return (
            <label
              className="relative flex cursor-pointer items-center justify-center p-1.5 transition-colors hover:bg-neutral-200 has-checked:bg-neutral-900 has-checked:text-white has-focus-visible:ring-1 has-focus-visible:ring-foreground has-focus-visible:ring-offset-1 has-focus-visible:ring-offset-background"
              htmlFor={idForInput}
              key={key}
              title={ICON_LABELS[key]}
            >
              <input
                className="sr-only"
                defaultChecked={key === initial}
                id={idForInput}
                name="icon"
                type="radio"
                value={key}
              />

              {Icon ? (
                <Icon aria-hidden className="size-4" weight="thin" />
              ) : (
                <span aria-hidden className="text-[9px] leading-none">
                  —
                </span>
              )}

              <span className="sr-only">{ICON_LABELS[key]}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
