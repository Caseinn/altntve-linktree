import type { Metadata } from "next"

import { Geist } from "next/font/google"

import { BRAND } from "@/config/brand"
import { SITE_ORIGIN } from "@/lib/url"

import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  description: BRAND.tagline,
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: BRAND.name, template: `%s · ${BRAND.name}` },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className={`${geistSans.variable} h-full antialiased`} lang="id">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
