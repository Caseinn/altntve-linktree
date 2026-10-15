import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut"
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight"
import { BehanceLogo } from "@phosphor-icons/react/dist/ssr/BehanceLogo"
import { BookOpen } from "@phosphor-icons/react/dist/ssr/BookOpen"
import { Briefcase } from "@phosphor-icons/react/dist/ssr/Briefcase"
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr/CalendarBlank"
import { Camera } from "@phosphor-icons/react/dist/ssr/Camera"
import { ChatCircle } from "@phosphor-icons/react/dist/ssr/ChatCircle"
import { Code } from "@phosphor-icons/react/dist/ssr/Code"
import { DiscordLogo } from "@phosphor-icons/react/dist/ssr/DiscordLogo"
import { DribbbleLogo } from "@phosphor-icons/react/dist/ssr/DribbbleLogo"
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple"
import { FigmaLogo } from "@phosphor-icons/react/dist/ssr/FigmaLogo"
import { GithubLogo } from "@phosphor-icons/react/dist/ssr/GithubLogo"
import { Globe } from "@phosphor-icons/react/dist/ssr/Globe"
import { Heart } from "@phosphor-icons/react/dist/ssr/Heart"
import { ImageSquare } from "@phosphor-icons/react/dist/ssr/ImageSquare"
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr/InstagramLogo"
import { LinkedinLogo } from "@phosphor-icons/react/dist/ssr/LinkedinLogo"
import { LinkSimple } from "@phosphor-icons/react/dist/ssr/LinkSimple"
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin"
import { MediumLogo } from "@phosphor-icons/react/dist/ssr/MediumLogo"
import { MusicNotes } from "@phosphor-icons/react/dist/ssr/MusicNotes"
import { Newspaper } from "@phosphor-icons/react/dist/ssr/Newspaper"
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt"
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone"
import { PinterestLogo } from "@phosphor-icons/react/dist/ssr/PinterestLogo"
import { Play } from "@phosphor-icons/react/dist/ssr/Play"
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr/ShoppingBag"
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr/ShoppingCart"
import { SignOut } from "@phosphor-icons/react/dist/ssr/SignOut"
import { SoundcloudLogo } from "@phosphor-icons/react/dist/ssr/SoundcloudLogo"
import { SpeakerHigh } from "@phosphor-icons/react/dist/ssr/SpeakerHigh"
import { SpotifyLogo } from "@phosphor-icons/react/dist/ssr/SpotifyLogo"
import { SquaresFour } from "@phosphor-icons/react/dist/ssr/SquaresFour"
import { Storefront } from "@phosphor-icons/react/dist/ssr/Storefront"
import { TelegramLogo } from "@phosphor-icons/react/dist/ssr/TelegramLogo"
import { ThreadsLogo } from "@phosphor-icons/react/dist/ssr/ThreadsLogo"
import { Ticket } from "@phosphor-icons/react/dist/ssr/Ticket"
import { TiktokLogo } from "@phosphor-icons/react/dist/ssr/TiktokLogo"
import { TwitchLogo } from "@phosphor-icons/react/dist/ssr/TwitchLogo"
import { User } from "@phosphor-icons/react/dist/ssr/User"
import { VideoCamera } from "@phosphor-icons/react/dist/ssr/VideoCamera"
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo"
import { XLogo } from "@phosphor-icons/react/dist/ssr/XLogo"
import { YoutubeLogo } from "@phosphor-icons/react/dist/ssr/YoutubeLogo"

/**
 * Icon components keyed by the short code stored on a link.
 *
 * `none` is a real entry so a cleared icon round-trips as an explicit choice
 * rather than an absent field.
 */
export const ICON_REGISTRY = {
  arrow: ArrowUpRight,
  audio: SpeakerHigh,
  bag: ShoppingBag,
  behance: BehanceLogo,
  blog: BookOpen,
  calendar: CalendarBlank,
  camera: Camera,
  cart: ShoppingCart,
  chat: ChatCircle,
  code: Code,
  discord: DiscordLogo,
  dribbble: DribbbleLogo,
  email: EnvelopeSimple,
  fav: Heart,
  figma: FigmaLogo,
  gallery: SquaresFour,
  github: GithubLogo,
  globe: Globe,
  image: ImageSquare,
  instagram: InstagramLogo,
  link: LinkSimple,
  linkedin: LinkedinLogo,
  linkout: ArrowSquareOut,
  location: MapPin,
  logout: SignOut,
  medium: MediumLogo,
  music: MusicNotes,
  news: Newspaper,
  none: null,
  phone: Phone,
  pinterest: PinterestLogo,
  play: Play,
  send: PaperPlaneTilt,
  shop: Storefront,
  soundcloud: SoundcloudLogo,
  spotify: SpotifyLogo,
  telegram: TelegramLogo,
  threads: ThreadsLogo,
  ticket: Ticket,
  tiktok: TiktokLogo,
  twitch: TwitchLogo,
  user: User,
  video: VideoCamera,
  whatsapp: WhatsappLogo,
  work: Briefcase,
  x: XLogo,
  youtube: YoutubeLogo,
} as const

/** A code that {@link ICON_REGISTRY} can resolve. */
export type IconKey = keyof typeof ICON_REGISTRY

/** Registry keys in display order. */
export const ICON_KEYS = Object.keys(ICON_REGISTRY) as IconKey[]

/**
 * Resolves a stored icon code to its component.
 *
 * Returns null for an unknown code so a link saved before an icon was removed
 * from the registry still renders.
 *
 * @param key - Stored icon code, or null when the link has no icon.
 */
export function getIcon(key: null | string | undefined) {
  if (!key) return null
  return isIconKey(key) ? ICON_REGISTRY[key] : null
}

/** Narrows an untrusted string to a registry key. */
export function isIconKey(value: string): value is IconKey {
  return value in ICON_REGISTRY
}

/** Human-readable name per key, for the picker and its tooltips. */
export const ICON_LABELS: Record<IconKey, string> = {
  arrow: "Arrow",
  audio: "Audio",
  bag: "Shopping",
  behance: "Behance",
  blog: "Blog",
  calendar: "Calendar",
  camera: "Camera",
  cart: "Cart",
  chat: "Chat",
  code: "Code",
  discord: "Discord",
  dribbble: "Dribbble",
  email: "Email",
  fav: "Favourite",
  figma: "Figma",
  gallery: "Gallery",
  github: "GitHub",
  globe: "Website",
  image: "Image",
  instagram: "Instagram",
  link: "Link",
  linkedin: "LinkedIn",
  linkout: "Outbound",
  location: "Location",
  logout: "Sign out",
  medium: "Medium",
  music: "Music",
  news: "News",
  none: "No icon",
  phone: "Phone",
  pinterest: "Pinterest",
  play: "Play",
  send: "Send",
  shop: "Shop",
  soundcloud: "SoundCloud",
  spotify: "Spotify",
  telegram: "Telegram",
  threads: "Threads",
  ticket: "Ticket",
  tiktok: "TikTok",
  twitch: "Twitch",
  user: "Account",
  video: "Video",
  whatsapp: "WhatsApp",
  work: "Work",
  x: "X",
  youtube: "YouTube",
}
