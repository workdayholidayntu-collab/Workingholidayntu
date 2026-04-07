import type { Metadata } from "next"
import { buildUrl } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(buildUrl("/")),
  title: {
    default: "棲地無界 WHV",
    template: "%s | 棲地無界 WHV",
  },
  description: "棲地無界 WHV 是為台灣出發者打造的打工度假知識庫、Realtime 討論區與過來人媒合平台。",
  applicationName: "棲地無界 WHV",
  openGraph: {
    title: "棲地無界 WHV",
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
    <html lang="zh-Hant">
      <body>
        {children}
      </body>
    </html>
  )
}
