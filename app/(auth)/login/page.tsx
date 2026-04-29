import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { loginAction, signInWithGoogleAction } from "@/app/actions"
import { SubmitButton } from "@/components/ui/submit-button"
import { getApprovedPosts, getCountries, getProfiles } from "@/lib/data"
import { formatDate } from "@/lib/utils"

export const metadata = { title: "登入" }

interface LoginPageProps {
  searchParams: Promise<{ error?: string; notice?: string }>
}

const fieldLabel = "block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-ink)]"
const fieldInput =
  "w-full border-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-ink)]/60 focus:border-[var(--brand)]"

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, notice } = await searchParams
  const [posts, countries, profiles] = await Promise.all([
    getApprovedPosts(),
    getCountries(),
    getProfiles(),
  ])
  const previewPost = posts[0]
  const previewCountry = previewPost
    ? countries.find((c) => c.slug === previewPost.country_slug)
    : undefined
  const previewAuthor = previewPost
    ? profiles.find((p) => p.id === previewPost.author_id)
    : undefined
  const previewAuthorName =
    previewAuthor?.nickname ?? previewPost?.author_display_name ?? "棲地無界"

  return (
    <div className="grid min-h-[calc(100vh-5rem)] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <section className="space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-ink)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          回首頁
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--brand)]">
            登入 Borderless Habitat
          </p>
          <h1 className="heading-editorial mt-3 text-[clamp(2.4rem,5vw,3.5rem)] text-[var(--ink)]">
            繼續閱讀<br />
            真實的過來人故事。
          </h1>
        </div>

        {notice ? (
          <div className="border-l-2 border-[var(--brand)] bg-[var(--brand)]/10 px-4 py-3 text-sm text-[var(--ink)]">
            {decodeURIComponent(notice)}
          </div>
        ) : null}

        {error ? (
          <div className="border-l-2 border-red-400 bg-red-50/70 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <form action={loginAction} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className={fieldLabel}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className={fieldInput}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className={fieldLabel}>密碼</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              placeholder="至少 6 個字元"
              className={fieldInput}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <SubmitButton pendingLabel="登入中…">使用 Email 登入</SubmitButton>
            <span className="text-xs text-[var(--muted-ink)]">或</span>
          </div>
        </form>

        <form action={signInWithGoogleAction}>
          <SubmitButton variant="outline" pendingLabel="連線 Google…">
            使用 Google 登入
          </SubmitButton>
        </form>

        <p className="text-sm text-[var(--muted-ink)]">
          還沒有帳號？{" "}
          <Link href="/register" className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline">
            立即註冊
          </Link>
        </p>
      </section>

      {previewPost ? (
        <aside className="hidden lg:block">
          <div className="rounded-3xl bg-[var(--sand)] p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
              先看一篇 ·
              {previewCountry ? ` ${previewCountry.flag_emoji} ${previewCountry.name_zh}` : ""}
            </p>
            <Link
              href={`/posts/${previewPost.slug}`}
              className="group mt-4 block"
            >
              <h2 className="heading-editorial text-2xl text-[var(--ink)] group-hover:text-[var(--brand)]">
                {previewPost.title}
              </h2>
              {previewPost.excerpt ? (
                <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">
                  {previewPost.excerpt}
                </p>
              ) : null}
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-ink)]">
                <span className="font-semibold text-[var(--ink)]">{previewAuthorName}</span>
                <span>·</span>
                <time>{formatDate(previewPost.created_at)}</time>
              </div>
            </Link>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
