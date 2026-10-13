/**
 * Fixed backdrop plate for the public page.
 *
 * Rendered by `app/page.tsx` rather than as a `body::before` rule so the
 * artwork stays scoped to the public profile. Every other route keeps the flat
 * page background.
 *
 * `bg-[length:auto_100%]` scales by height so the drawing keeps one proportion
 * at every screen size. `cover` only matches that on phones, where the viewport
 * is tall enough for height to be the limiting dimension; on wide screens cover
 * flips to width, scales the artwork past its natural size, and the globe grows
 * to roughly twice the viewport height.
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
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[url(/background.webp)] bg-[length:auto_100%] bg-center bg-no-repeat opacity-50"
      />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,var(--background)_0%,transparent_18%,transparent_82%,var(--background)_100%)]"
      />
    </>
  )
}
