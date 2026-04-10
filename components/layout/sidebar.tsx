import Link from "next/link"
import Image from "next/image"
import { BookOpenText } from "lucide-react"
import type { Country } from "@/types"

export function Sidebar({ countries }: { countries: Country[] }) {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-[var(--line)] px-6 py-8 xl:block">
      <div className="space-y-8">
        <div className="space-y-3 rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-5">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">棲地無界 / WHV</p>
          </div>
          <h2 className="text-xl font-bold text-[var(--ink)]">從這裡快速展開各國資訊與內容。</h2>
          <p className="text-sm leading-6 text-[var(--muted-ink)]">
            你可以直接從下方國家快捷入口瀏覽，也可以用右上角搜尋更快找到想看的主題。
          </p>
        </div>

        <div className="rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <BookOpenText className="h-4 w-4 text-[var(--brand)]" />
            18 國快速入口
          </div>
          <div className="grid grid-cols-2 gap-2">
            {countries.map((country) => (
              <Link
                key={country.slug}
                href={`/countries/${country.slug}`}
                className="rounded-2xl border border-[var(--line)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--ink)] transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="mb-1 text-lg">{country.flag_emoji}</div>
                <div className="font-medium">{country.name_zh}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
