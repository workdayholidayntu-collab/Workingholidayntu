import Link from "next/link"
import Image from "next/image"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const linkGroups = [
  {
    title: "瀏覽",
    links: [
      { label: "過來人故事", href: "/" },
      { label: "國家知識庫", href: "/countries" },
      { label: "搜尋", href: "/search" },
    ],
  },
  {
    title: "棲地無界",
    links: [
      { label: "關於我們", href: "/about" },
      { label: "撰寫文章", href: "/posts/new" },
    ],
  },
  {
    title: "條款",
    links: [
      { label: "使用條款", href: "/terms" },
      { label: "隱私政策", href: "/privacy" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--background)] mt-20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="棲地無界" width={28} height={28} />
              <span className="text-sm font-bold text-[var(--ink)]">棲地無界</span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-[var(--muted-ink)]">
              讓每個回來的人，成為下一個出發者的底氣。
            </p>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                {group.title}
              </p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--ink)] transition hover:text-[var(--brand)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
          <p className="text-xs text-[var(--muted-ink)]">
            © {new Date().getFullYear()} 棲地無界 Borderless Habitat
          </p>
          <a
            href="https://www.instagram.com/workdayholiday.ntu/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-[var(--muted-ink)] transition hover:text-[var(--ink)]"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
