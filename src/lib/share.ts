/** What the page offers to share about itself. */
export type ShareContent = {
  text: string
  title: string
  url: string
}

/**
 * One row in the share sheet.
 *
 * `href` is null for the copy action, which is a button rather than a link, so
 * the caller can pick the element without a second lookup.
 */
export type ShareTarget = {
  href: null | string
  id: ShareTargetId
  label: string
}

/** A row in the share sheet, narrowing to its icon lookup. */
export type ShareTargetId =
  "copy" | "email" | "linkedin" | "reddit" | "telegram" | "whatsapp" | "x"

/**
 * Builds the share rows for one page.
 *
 * @param content - Page title, text, and the URL being shared.
 * @returns One entry per target, in display order.
 */
export function buildShareTargets({ text, title, url }: ShareContent) {
  const query = `text=${encodeURIComponent(text)}`
  const target = `url=${encodeURIComponent(url)}`

  return [
    { href: null, id: "copy", label: "Copy Link" },
    {
      href: `https://x.com/intent/tweet?${query}&${target}`,
      id: "x",
      label: "X",
    },
    {
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`.trim())}`,
      id: "whatsapp",
      label: "WhatsApp",
    },
    {
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
      id: "email",
      label: "Email",
    },
    {
      href: `https://www.linkedin.com/sharing/share-offsite/?${target}`,
      id: "linkedin",
      label: "LinkedIn",
    },
    {
      href: `https://t.me/share/url?${target}&${query}`,
      id: "telegram",
      label: "Telegram",
    },
    {
      href: `https://www.reddit.com/submit?${target}&title=${encodeURIComponent(title)}`,
      id: "reddit",
      label: "Reddit",
    },
  ] satisfies ShareTarget[]
}
