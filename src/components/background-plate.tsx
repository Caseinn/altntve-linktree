import { BACKGROUND } from "@/config/brand"

/**
 * Artwork and edge mask, minus the positioning scheme, so the dashboard preview
 * can mount them `absolute` inside a frame while the page mounts them `fixed`.
 */
export const PLATE_ARTWORK_CLASS =
  "pointer-events-none top-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2"

/** Gradient that fades the plate back into the page background at both edges. */
export const PLATE_FADE_CLASS =
  "pointer-events-none bg-[linear-gradient(to_right,var(--background)_0%,transparent_18%,transparent_82%,var(--background)_100%)]"

/** Intrinsic size of every plate image, because uploads are normalised to it. */
export const PLATE_SIZE = {
  height: BACKGROUND.height,
  width: BACKGROUND.width,
}

const STATIC_AVIF = "/background.avif"
const STATIC_WEBP = "/background.webp"

type BackgroundPlateProps = {
  /** Admin upload, or `null` for the bundled artwork. Both are needed to use it. */
  avifUrl?: null | string
  /** Whole percent, already clamped by `siteSchema`. */
  opacity?: number
  webpUrl?: null | string
}

/**
 * Fixed backdrop for the public page, masked at both viewport edges by a
 * gradient back to the page background.
 *
 * Sizes the artwork by height rather than with `object-fit`: `cover` doubles
 * the globe on wide screens and `contain` leaves bands on phones. Only `height`
 * is definite in CSS, so the `width`/`height` attributes are load-bearing here
 * and depend on every upload arriving at `PLATE_SIZE`.
 */
export function BackgroundPlate({
  avifUrl,
  opacity = BACKGROUND.defaultOpacity,
  webpUrl,
}: BackgroundPlateProps) {
  const avif = avifUrl && webpUrl ? avifUrl : STATIC_AVIF
  const webp = avifUrl && webpUrl ? webpUrl : STATIC_WEBP

  return (
    <>
      <picture>
        <source srcSet={avif} type="image/avif" />

        <img
          alt=""
          aria-hidden
          className={`fixed -z-10 ${PLATE_ARTWORK_CLASS}`}
          decoding="async"
          fetchPriority="low"
          height={PLATE_SIZE.height}
          src={webp}
          style={{ opacity: opacity / 100 }}
          width={PLATE_SIZE.width}
        />
      </picture>

      <div aria-hidden className={`fixed inset-0 -z-10 ${PLATE_FADE_CLASS}`} />
    </>
  )
}
