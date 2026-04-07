import Link from "next/link"
import Image from "next/image"
import { Earth, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

const primaryNav = [
  { href: "/countries", label: "國家知識庫", icon: Earth },
  { href: "/search", label: "搜尋", icon: Search },
]

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(244,248,251,0.82)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-3">
            <Image src="/logo.png" alt="棲地無界" width={36} height={36} className="shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[var(--ink)]">棲地無界</p>
              <p className="truncate text-xs text-[var(--muted-ink)]">WHV 打工度假知識庫</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {primaryNav.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className="gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 md:hidden">
          {primaryNav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brand)]/40"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
