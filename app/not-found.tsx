import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10">
      <Card className="w-full">
        <CardContent className="space-y-6 p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">404 / 棲地無界</p>
          <h1 className="text-3xl font-semibold text-[var(--ink)]">這一頁還沒有被整理進棲地無界。</h1>
          <p className="text-base leading-8 text-[var(--muted-ink)]">
            你可以先回到首頁、進入 18 國知識庫，或從搜尋開始找目前已整理好的內容。
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button>回到首頁</Button>
            </Link>
            <Link href="/countries">
              <Button variant="outline">前往國家知識庫</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
