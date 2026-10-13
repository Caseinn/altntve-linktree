export type ShareContent = {
  text: string
  title: string
  url: string
}

export type ShareTarget = {
  href: null | string
  id: ShareTargetId
  label: string
}

export type ShareTargetId =
  "copy" | "email" | "linkedin" | "reddit" | "telegram" | "whatsapp" | "x"

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

export function shareSummary({ text, title }: ShareContent) {
  return text ? `${title} — ${text}` : title
}
