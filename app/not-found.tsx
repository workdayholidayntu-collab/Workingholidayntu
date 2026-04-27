import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-10 px-4 py-16 sm:px-6">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--brand)]">
          404 · Borderless Habitat
        </p>
        <h1 className="heading-editorial text-[clamp(2.4rem,6vw,4rem)] leading-tight text-[var(--ink)]">
          路標還沒立到這裡。
        </h1>
        <p className="text-base leading-8 text-[var(--muted-ink)]">
          這個頁面可能是還沒寫的章節、已經被搬走，或是輸入錯了一個字。
          建議從以下三條路重新開始你的查找。
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        <Suggestion
          tag="HOME"
          title="回到首頁"
          copy="看最新刊出的過來人故事與專題。"
          href="/"
        />
        <Suggestion
          tag="ATLAS"
          title="18 國知識庫"
          copy="從各國 WHV 規則、就業現況開始查。"
          href="/countries"
        />
        <Suggestion
          tag="SEARCH"
          title="關鍵字搜尋"
          copy="直接輸入想找的主題，例如「澳洲 農場」。"
          href="/search"
        />
      </ul>

      <form action="/search" className="flex gap-2 border-t border-[var(--line)] pt-6">
        <input
          name="q"
          placeholder="輸入主題、國家、人物 ──"
          className="flex-1 border-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-ink)]/60 focus:border-[var(--brand)]"
        />
        <Button type="submit">搜尋</Button>
      </form>
    </main>
  )
}

interface SuggestionProps {
  tag: string
  title: string
  copy: string
  href: string
}

function Suggestion({ tag, title, copy, href }: SuggestionProps) {
  return (
    <li>
      <Link
        href={href}
        className="group block h-full rounded-3xl bg-[var(--sand)] p-6 transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--brand)]">{tag}</p>
        <p className="heading-editorial mt-3 text-lg text-[var(--ink)] group-hover:text-[var(--brand)]">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-ink)]">{copy}</p>
      </Link>
    </li>
  )
}
