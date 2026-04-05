import Link from "next/link"
import Image from "next/image"
import { BookOpenText, Earth, Search } from "lucide-react"
import type { Country } from "@/types"

const navItems = [
  { href: "/countries", label: "國家知識庫", icon: Earth },
  { href: "/search", label: "搜尋主題", icon: Search },
]

export function Sidebar({ countries }: { countries: Country[] }) {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-[var(--line)] px-6 py-8 xl:block">
      <div className="space-y-8">
        <div className="space-y-3 rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-5">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="" width={24} height={24} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">棲地無界 / WHV</p>
          </div>
          <h2 className="text-xl font-bold text-[var(--ink)]">先決定入口，再往下展開內容與互動。</h2>
          <p className="text-sm leading-6 text-[var(--muted-ink)]">
            如果你是第一次進站，建議先從國家知識庫開始；如果你已經有明確問題，也可以直接走搜尋入口。
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--muted-ink)] transition hover:bg-[var(--card)] hover:text-[var(--ink)]"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <BookOpenText className="h-4 w-4 text-[var(--brand)]" />
            17 國快速入口
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
