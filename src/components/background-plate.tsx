/**
 * Fixed backdrop plate for the public page, plus a gradient that masks the
 * artwork back to the page background at both viewport edges where the dot
 * pattern is densest.
 *
 * Scoped to `app/page.tsx` rather than `body::before` so the artwork stays on
 * the public profile and other routes keep the flat background.
 *
 * `h-full` with `w-auto` reproduces `background-size: auto 100%`. Neither
 * `object-fit` value matches: `cover` blows the globe up to roughly twice the
 * viewport height on wide screens, `contain` shrinks it to leave empty bands
 * above and below on phones. `max-w-none` defeats the Tailwind preflight
 * `max-width: 100%` so the width may overflow and the sides crop as intended.
 *
 * `<picture>` over a CSS `background-image` for discovery, not fidelity: a
 * background URL stays invisible to the preload scanner until the stylesheet
 * has downloaded and parsed. AVIF halves the payload at matched dot density.
 *
 * `fetchPriority="low"` because the avatar is the LCP element and already holds
 * `fetchPriority="high"`; decoration must not win bandwidth from the thing that
 * gates paint.
 *
 * Negative z-index is safe here because `html` sets no background, so `body`'s
 * propagates to the canvas and paints behind every negative z-index descendant.
 *
 * `opacity-50` is a taste call within a wide legal range, not a contrast
 * threshold: `neutral-600` clears 4.5:1 anywhere from 0 to 0.84, and
 * `neutral-500` never clears it without erasing the artwork, so that ink needs
 * a darker value at the call sites rather than a fainter plate.
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
