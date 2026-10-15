import { ImageResponse } from "next/og"

import { getSite } from "@/lib/queries"

export const alt = "ALTNTVE"
export const size = { height: 630, width: 1200 }
export const contentType = "image/png"

/** Open Graph card rendering the emblem, display name, and tagline. */
export default async function OpengraphImage() {
  const site = await getSite()

  return new ImageResponse(
    <div
      style={{
        background: "#ffffff",
        color: "#171717",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "80px",
        width: "100%",
      }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: 20 }}>
        <svg fill="none" height="44" viewBox="0 0 24 24" width="44">
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4.5"
            stroke="#171717"
            strokeWidth="1"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="4.5"
            ry="10"
            stroke="#171717"
            strokeWidth="1"
          />
        </svg>
        <span
          style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em" }}
        >
          {site.displayName}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 62,
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
          maxWidth: 900,
        }}
      >
        {site.tagline}
      </div>
    </div>,
    size,
  )
}
