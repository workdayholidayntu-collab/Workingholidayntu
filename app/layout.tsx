import type { Metadata } from "next"
import { Newsreader, Noto_Sans_TC } from "next/font/google"
import { buildUrl } from "@/lib/utils"
import "./globals.css"

const sans = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans-tc",
  display: "swap",
})

const serifLatin = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif-latin",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(buildUrl("/")),
  title: {
    default: "棲地無界 Borderless Habitat",
    template: "%s | 棲地無界 Borderless Habitat",
  },
  description: "棲地無界 Borderless Habitat 是為台灣出發者打造的打工度假知識庫、Realtime 討論區與過來人媒合平台。",
  applicationName: "棲地無界 Borderless Habitat",
  openGraph: {
    title: "棲地無界 Borderless Habitat",
    description: "把台灣打工度假的散落經驗，整理成真正能接住人的平台。",
    type: "website",
    locale: "zh_TW",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${sans.variable} ${serifLatin.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
