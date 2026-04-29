import Link from "next/link"
import Image from "next/image"
import { signOutAction } from "@/app/actions"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LinkPendingInline } from "@/components/ui/link-pending-inline"
import { LinkPendingOverlay } from "@/components/ui/link-pending-overlay"
import { NavTabs } from "@/components/layout/nav-tabs"
import { getCurrentViewer } from "@/lib/data"

export async function Header() {
  const viewer = await getCurrentViewer()
  const nickname = viewer.profile?.nickname ?? null
  const isLoggedIn = Boolean(viewer.userId)
  const isAdmin = (viewer.profile?.trust_level ?? 0) >= 3

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(244,248,251,0.9)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.png" alt="棲地無界" width={26} height={26} />
          <span className="hidden text-[15px] font-bold text-[var(--ink)] sm:inline">
            棲地無界
          </span>
        </Link>

        <div className="hidden flex-1 md:block">
          <NavTabs />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0 md:gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/posts/new"
                className="hidden items-center gap-1.5 text-sm font-semibold text-[var(--muted-ink)] transition hover:text-[var(--ink)] sm:inline-flex"
              >
                <LinkPendingInline />
                撰寫
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="hidden items-center gap-1.5 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-strong)] sm:inline-flex"
                >
                  <LinkPendingInline />
                  審查後台
                </Link>
              ) : null}
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="cursor-pointer text-sm font-semibold text-[var(--muted-ink)] transition hover:text-[var(--ink)]"
                >
                  登出
                </button>
              </form>
              <Link
                href="/profile"
                aria-label={`${nickname ?? "你的"}個人頁`}
                className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
              >
                <Avatar className="h-9 w-9" name={nickname} />
                <LinkPendingOverlay spinnerClassName="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted-ink)] transition hover:text-[var(--ink)]"
              >
                <LinkPendingInline />
                登入
              </Link>
              <Link href="/register" className="relative inline-flex">
                <Button className="!px-4 !py-2 !text-sm">註冊</Button>
                <LinkPendingOverlay spinnerClassName="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
