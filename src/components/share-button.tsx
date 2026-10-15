"use client"

import { Check } from "@phosphor-icons/react"
import { Copy } from "@phosphor-icons/react"
import { DotsThree } from "@phosphor-icons/react"
import { EnvelopeSimple } from "@phosphor-icons/react"
import { LinkedinLogo } from "@phosphor-icons/react"
import { RedditLogo } from "@phosphor-icons/react"
import { ShareNetwork } from "@phosphor-icons/react"
import { TelegramLogo } from "@phosphor-icons/react"
import { WhatsappLogo } from "@phosphor-icons/react"
import { XLogo } from "@phosphor-icons/react"
import * as React from "react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { buildShareTargets } from "@/lib/share"

const SHARE_ICONS = {
  copy: Copy,
  email: EnvelopeSimple,
  linkedin: LinkedinLogo,
  reddit: RedditLogo,
  telegram: TelegramLogo,
  whatsapp: WhatsappLogo,
  x: XLogo,
} as const

const CHIP =
  "flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"

/**
 * Floating share trigger at top right.
 *
 * Tapping opens a bottom drawer with a horizontally scrolling row of share
 * targets so the full list is accessible in one swipe. `More` falls back to
 * `navigator.share` where available. The page URL is read when the drawer
 * opens so prerendered markup stays origin-independent.
 */
export function ShareButton({ text, title }: { text: string; title: string }) {
  const isTouch = useIsTouchDevice()
  const [canNativeShare] = React.useState(
    typeof navigator !== "undefined" && typeof navigator.share === "function",
  )
  const [isCopied, setIsCopied] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [url, setUrl] = React.useState("")

  const targets = React.useMemo(
    () => buildShareTargets({ text, title, url }),
    [text, title, url],
  )

  function handleOpenChange(open: boolean) {
    setIsOpen(open)

    if (open) {
      setUrl(window.location.href)
    } else {
      setIsCopied(false)
    }
  }

  /**
   * Copies the page URL, leaving the chip unchanged when the browser refuses.
   *
   * Clipboard writes are blocked outside secure contexts, which is a normal state
   * on an HTTP host rather than a fault worth surfacing.
   */
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {}
  }

  async function shareMore() {
    await navigator.share({ text, title, url }).catch(() => {})
  }

  if (!isTouch) return null

  return (
    <Drawer direction="bottom" onOpenChange={handleOpenChange} open={isOpen}>
      <DrawerTrigger
        aria-label="Share"
        className="group fixed top-[max(1.25rem,env(safe-area-inset-top))] right-[max(1.25rem,env(safe-area-inset-right))] z-40 flex size-11 cursor-pointer items-center justify-center rounded-full bg-neutral-200 text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ShareNetwork aria-hidden className="size-5" weight="thin" />
      </DrawerTrigger>

      <DrawerContent className="bg-background pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <DrawerHeader className="gap-1 border-b border-foreground/15 pb-5 text-left">
          <DrawerTitle className="editorial">Share</DrawerTitle>
          <DrawerDescription className="text-sm text-neutral-600">
            {text}
          </DrawerDescription>
        </DrawerHeader>

        <div className="relative">
          <div className="no-scrollbar overflow-x-auto px-4 pt-4 pb-2">
            <div className="flex w-max items-start gap-4">
              {targets.map((target) => {
                const isCopiedChip = target.id === "copy" && isCopied
                const Icon = isCopiedChip ? Check : SHARE_ICONS[target.id]
                const label = isCopiedChip ? "Copied" : target.label

                const chip = !target.href ? (
                  <button
                    aria-label={label}
                    className={CHIP}
                    onClick={copyLink}
                    title={label}
                    type="button"
                  >
                    <Icon aria-hidden className="size-5" weight="thin" />
                  </button>
                ) : (
                  <DrawerClose asChild>
                    <a
                      aria-label={target.label}
                      className={CHIP}
                      href={target.href}
                      rel="noopener noreferrer"
                      target="_blank"
                      title={target.label}
                    >
                      <Icon aria-hidden className="size-5" weight="thin" />
                    </a>
                  </DrawerClose>
                )

                return (
                  <div
                    className="flex shrink-0 flex-col items-center gap-2"
                    key={target.id}
                  >
                    {chip}
                    <span className="text-xs text-neutral-500">{label}</span>
                  </div>
                )
              })}

              {canNativeShare ? (
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <DrawerClose asChild>
                    <button
                      aria-label="More share options"
                      className={CHIP}
                      onClick={shareMore}
                      title="More"
                      type="button"
                    >
                      <DotsThree aria-hidden className="size-5" weight="thin" />
                    </button>
                  </DrawerClose>
                  <span className="text-xs text-neutral-500">More</span>
                </div>
              ) : null}
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent"
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouch(window.matchMedia("(pointer: coarse)").matches)
  }, [])

  return isTouch
}
