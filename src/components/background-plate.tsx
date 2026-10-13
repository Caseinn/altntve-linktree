/**
 * Fixed backdrop plate for the public page.
 *
 * Rendered by `app/page.tsx` rather than as a `body::before` rule so the
 * artwork stays scoped to the public profile. Every other route keeps the flat
 * page background.
 *
 * Sizing reproduces `background-size: auto 100%`: height is pinned to the
 * viewport and the width follows from the aspect ratio, so the drawing keeps one
 * proportion at every screen size. `object-fit: cover` does not. On phones,
 * where the viewport is tall enough that height is the limiting dimension, the
 * two agree; on wide screens cover flips to width, scales the artwork past its
 * natural size, and grows the globe to roughly twice the viewport height.
 *
 * `object-contain` would also be wrong here, and in the opposite direction. It
 * fits inside both axes, so on a 390x844 phone it shrinks the globe to 390x488
 * and leaves empty bands above and below, where `auto 100%` renders it 675x844
 * and crops the sides. The globe is meant to bleed past the frame, so the width
 * is allowed to overflow and the horizontal centring does the cropping.
 * `max-w-none` is required to defeat the Tailwind preflight `max-width: 100%`
 * on images, and `h-full` to defeat its paired `height: auto`.
 *
 * `<picture>` rather than a CSS `background-image` for discovery, not fidelity.
 * A background URL is invisible to the preload scanner: the browser cannot see
 * it until the stylesheet has downloaded and been parsed, so the artwork always
 * trails the text by a full CSS round trip. An `<img>` in the markup is found
 * during the initial HTML scan. The AVIF source halves the payload against the
 * original WebP at matched dot density, and the WebP stays as the fallback.
 *
 * `fetchPriority="low"` is deliberate. The avatar is the LCP element and already
 * claims `fetchPriority="high"`; this plate is decoration behind the copy, so it
 * must not compete for bandwidth ahead of the thing that actually gates paint.
 * `decoding="async"` keeps the decode off the critical path for the same reason.
 *
 * Negative z-index keeps it behind the in-flow content. It is safe against the
 * flat background because `html` sets no background of its own, so `body`'s
 * background propagates to the canvas and paints behind every negative
 * z-index descendant.
 *
 * `opacity-50` is a taste call, not a contrast threshold. Measured against the
 * centre column of the artwork: dots land at rgb(186), the orbital hairlines at
 * rgb(113), composited over the page background (`oklch(0.986 0.004 85)`,
 * rgb(252,250,247)). Two consequences worth keeping straight:
 *
 *   - `foreground` clears 4.5:1 even at full strength (10.2:1 over a dot), so
 *     the fade does not rescue the primary ink. Nothing was broken there.
 *   - `neutral-600` is the one level the fade actually governs: it fails at
 *     full strength (4.03:1) and clears the floor at any opacity up to 0.84.
 *
 * Values between 0 and 0.84 are all equally correct for that ink, so the pick
 * is made on the artwork, not the maths. `DESIGN.md` asks for graphics that stay
 * "subtle, providing texture without competing with the typography", and half
 * strength keeps the globe legible while pushing it back behind the copy.
 *
 * `text-neutral-500` is the level the fade cannot fix. It is 4.62:1 on flat page
 * and needs opacity at or below 0.04 to survive a dot, which would erase the
 * artwork outright. It sits on link notes, location, email, and the row caret,
 * so those call sites need a darker ink regardless. Fading the plate is the
 * cheaper half of the fix, not the whole of it.
 */
export function BackgroundPlate() {
  return (
    <>
      <picture>
        <source srcSet="/background.avif" type="image/avif" />

        <img
          alt=""
          aria-hidden
          className="pointer-events-none fixed top-0 left-1/2 -z-10 h-full w-auto max-w-none -translate-x-1/2 opacity-50"
          decoding="async"
          fetchPriority="low"
          height={1350}
          src="/background.webp"
          width={1080}
        />
      </picture>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,var(--background)_0%,transparent_18%,transparent_82%,var(--background)_100%)]"
      />
    </>
  )
}
