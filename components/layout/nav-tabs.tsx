"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LinkPendingInline } from "@/components/ui/link-pending-inline"
import { COUNTRIES_ENABLED } from "@/lib/features"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "過來人故事", href: "/" },
  ...(COUNTRIES_ENABLED ? [{ label: "國家知識庫", href: "/countries" }] : []),
  { label: "關於我們", href: "/about" },
]

export function NavTabs() {
  const pathname = usePathname()

  return (
    <nav className="-mb-px flex gap-6 overflow-x-auto md:gap-8">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/" || pathname.startsWith("/posts")
            : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap py-1 text-[13px] font-medium tracking-wide transition",
              isActive
                ? "text-[var(--ink)]"
                : "text-[var(--muted-ink)] hover:text-[var(--ink)]",
            )}
          >
            <LinkPendingInline />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
