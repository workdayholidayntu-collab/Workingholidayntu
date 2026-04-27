import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { registerAction, signInWithGoogleAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { TurnstileWidget } from "@/components/turnstile/turnstile-widget"
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile"

export const metadata = { title: "註冊" }

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>
}

const fieldLabel = "block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-ink)]"
const fieldInput =
  "w-full border-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-ink)]/60 focus:border-[var(--brand)]"

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams

  const valueProps = [
    {
      label: "閱讀過來人訪談",
      copy: "解鎖完整文章、留言互動、向作者提問。",
    },
    {
      label: "分享你的經驗",
      copy: "通過初次審核後可直接發表文章，下次出發者會用得上。",
    },
    {
      label: "追蹤關注的國家",
      copy: "新故事上架時得到通知，社群打工度假最快的入口。",
    },
  ]

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
            加入 Borderless Habitat
          </p>
          <h1 className="heading-editorial mt-3 text-[clamp(2.4rem,5vw,3.5rem)] text-[var(--ink)]">
            把你走過的路<br />
            留給下一位出發者。
          </h1>
        </div>

        {error ? (
          <div className="border-l-2 border-red-400 bg-red-50/70 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <form action={registerAction} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="nickname" className={fieldLabel}>暱稱</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              minLength={2}
              maxLength={30}
              placeholder="2-30 個字元"
              className={fieldInput}
            />
          </div>
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
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="至少 8 個字元，需含英文字母與數字"
              className={fieldInput}
            />
          </div>
          <label className="flex items-start gap-3 text-xs leading-6 text-[var(--muted-ink)]">
            <input
              type="checkbox"
              name="acceptTerms"
              required
              className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--line)] accent-[var(--brand)]"
            />
            <span>
              我已閱讀並同意{" "}
              <Link href="/terms" className="font-semibold text-[var(--ink)] underline-offset-4 hover:underline">
                使用條款
              </Link>
              {" 與 "}
              <Link href="/privacy" className="font-semibold text-[var(--ink)] underline-offset-4 hover:underline">
                隱私政策
              </Link>
              。
            </span>
          </label>
          {TURNSTILE_SITE_KEY ? (
            <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} />
          ) : null}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit">建立帳號</Button>
            <span className="text-xs text-[var(--muted-ink)]">或</span>
          </div>
        </form>

        <form action={signInWithGoogleAction}>
          <Button type="submit" variant="outline">
            使用 Google 註冊
          </Button>
        </form>

        <p className="text-xs leading-6 text-[var(--muted-ink)]">
          已經有帳號？{" "}
          <Link href="/login" className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline">
            前往登入
          </Link>
        </p>
      </section>

      <aside className="hidden lg:block">
        <div className="rounded-3xl bg-[var(--sand)] p-8 space-y-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
            註冊以後可以
          </p>
          <ol className="space-y-5">
            {valueProps.map((item, index) => (
              <li key={item.label} className="flex gap-4">
                <span className="font-editorial text-3xl font-bold leading-none text-[var(--ink)]/30">
                  0{index + 1}
                </span>
                <div>
                  <p className="heading-editorial text-base text-[var(--ink)]">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-ink)]">{item.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  )
}
