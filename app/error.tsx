"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalSegmentError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[/app/error.tsx]", error)
    }
  }, [error])

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--brand)]">
          500 · Borderless Habitat
        </p>
        <h1 className="heading-editorial text-[clamp(2rem,5vw,3.25rem)] leading-tight text-[var(--ink)]">
          這條路上有點亂石，<br />
          請稍等讓我們重新鋪一次。
        </h1>
        <p className="text-base leading-8 text-[var(--muted-ink)]">
          系統剛才碰到一個沒料到的錯誤。你可以試著重新載入這個頁面；如果還是進不去，
          先繞回首頁，我們會把問題收進編輯部的修補清單。
        </p>
        {error.digest ? (
          <p className="font-mono text-[11px] text-[var(--muted-ink)]/80">
            錯誤代碼：{error.digest}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>重新載入</Button>
        <Link href="/">
          <Button variant="outline">回到首頁</Button>
        </Link>
      </div>
    </main>
  )
}
