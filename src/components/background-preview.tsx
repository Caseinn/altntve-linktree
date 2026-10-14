import Image from "next/image"

import {
  PLATE_ARTWORK_CLASS,
  PLATE_FADE_CLASS,
  PLATE_SIZE,
} from "@/components/background-plate"

/**
 * Viewport shapes to check the plate against, as width over height. A phone sits
 * near 9:19.5, where the artwork overflows and the sides crop; a desktop window
 * is wider than the artwork at full height, so the edge mask carries the
 * transition instead.
 *
 * Below `sm` the frames share one clamped height and take their widths from
 * these ratios, which keeps them level at any viewport instead of letting the
 * narrower one set the row height. From `sm` up, widths are fixed and the
 * heights fall out of the ratios.
 */
const FRAMES = [
  { label: "Phone", ratio: "9 / 19.5", size: "sm:w-[7.5rem]" },
  { label: "Desktop", ratio: "16 / 10", size: "sm:w-[26rem]" },
] as const

/** Shared frame height below `sm`, bounded to stay inside a 320px viewport. */
const MOBILE_HEIGHT = "h-[clamp(6rem,36vw,9.375rem)] sm:h-auto"

/**
 * Renders the plate's real classes inside two clipped frames, so the preview
 * shows the crop that ships rather than a fitted approximation.
 *
 * `avifUrl` is nullable because a freshly picked file is cropped in the browser
 * and exists as one format; declaring it `type="image/avif"` would make
 * AVIF-capable browsers select a blob they cannot decode.
 *
 * @param props - The effective background, already cropped to the plate ratio.
 */
export function BackgroundPreview({
  avifUrl,
  opacity,
  webpUrl,
}: {
  avifUrl: null | string
  opacity: number
  webpUrl: string
}) {
  return (
    <div className="flex items-end gap-4 sm:gap-6">
      {FRAMES.map((frame) => (
        <figure className="flex flex-col gap-2" key={frame.label}>
          <div
            className={`relative overflow-hidden rounded-sm border border-foreground/10 bg-background ${MOBILE_HEIGHT} ${frame.size}`}
            style={{ aspectRatio: frame.ratio }}
          >
            <picture>
              {avifUrl ? <source srcSet={avifUrl} type="image/avif" /> : null}

              <Image
                alt=""
                aria-hidden
                className={`absolute ${PLATE_ARTWORK_CLASS}`}
                decoding="async"
                height={PLATE_SIZE.height}
                src={webpUrl}
                style={{ opacity: opacity / 100 }}
                unoptimized
                width={PLATE_SIZE.width}
              />
            </picture>

            <div
              aria-hidden
              className={`absolute inset-0 ${PLATE_FADE_CLASS}`}
            />
          </div>

          <figcaption className="text-xs text-muted-foreground">
            {frame.label}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
