import { redirect } from "next/navigation"
import { createPostAction } from "@/app/actions"
import { PostEditor } from "@/components/post/post-editor"
import { TurnstileWidget } from "@/components/turnstile/turnstile-widget"
import { SubmitButton } from "@/components/ui/submit-button"
import { getCountries, getCurrentViewer } from "@/lib/data"
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile"

export const metadata = { title: "撰寫過來人故事" }

interface NewPostPageProps {
  searchParams: Promise<{ error?: string }>
}

const fieldLabel = "block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-ink)]"
const fieldInput =
  "w-full border-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-ink)]/60 focus:border-[var(--brand)]"

export default async function NewPostPage({ searchParams }: NewPostPageProps) {
  const [{ error }, viewer, countries] = await Promise.all([
    searchParams,
    getCurrentViewer(),
    getCountries(),
  ])

  if (!viewer.userId) {
    redirect("/login?error=" + encodeURIComponent("請先登入後再投稿"))
  }

  const trustLevel = viewer.profile?.trust_level ?? 0
  const willAutoPublish = trustLevel >= 1

  return (
    <div className="space-y-10">
      <header className="grid gap-6 sm:grid-cols-[1.4fr_1fr] sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--brand)]">
            撰寫 · Borderless Habitat
          </p>
          <h1 className="heading-editorial mt-3 whitespace-nowrap text-[clamp(0.85rem,1.8vw,1.6rem)] text-[var(--ink)]">
            讓每個回來的人，成為下一個出發者的底氣。
          </h1>
        </div>
        <div className="rounded-2xl bg-[var(--sand)] p-5 text-sm leading-7 text-[var(--muted-ink)]">
          <p>
            <span className="font-semibold text-[var(--ink)]">你的信任等級：</span>
            <span className="font-editorial ml-1 text-base font-semibold text-[var(--brand)]">
              Lv {trustLevel}
            </span>
          </p>
          <p className="mt-1 text-xs">
            {willAutoPublish
              ? "送出後會直接刊出。"
              : "送出後會進入待審清單，棲地無界編輯通過後才會公開。"}
          </p>
        </div>
      </header>

      {error ? (
        <div className="border-l-2 border-red-400 bg-red-50/70 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      ) : null}

      <form action={createPostAction} className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="countrySlug" className={fieldLabel}>國家</label>
            <select
              id="countrySlug"
              name="countrySlug"
              required
              defaultValue=""
              className={`${fieldInput} appearance-none cursor-pointer`}
            >
              <option value="" disabled>
                選擇國家
              </option>
              {countries.map((country) => (
                <option key={country.slug} value={country.slug}>
                  {country.flag_emoji} {country.name_zh} {country.name_en}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="tags" className={fieldLabel}>標籤（用逗號分隔）</label>
            <input
              id="tags"
              name="tags"
              type="text"
              placeholder="如：J-1, WAT, 服務業, 公路旅行"
              className={fieldInput}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className={fieldLabel}>標題</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={6}
            maxLength={120}
            placeholder="例如：從交換生到準巴黎人"
            className={`${fieldInput} text-2xl font-bold text-[var(--ink)]`}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="excerpt" className={fieldLabel}>摘要 (20-220 字)</label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            minLength={20}
            maxLength={220}
            rows={3}
            placeholder="一句話讓人想點進來看的引言。"
            className={`${fieldInput} resize-y`}
          />
        </div>

        <div className="space-y-2">
          <span className={fieldLabel}>內文</span>
          <PostEditor />
          <p className="text-xs text-[var(--muted-ink)]">
            支援標題、清單、粗體、斜體。送出時會過濾不安全的標籤。
          </p>
        </div>

        {TURNSTILE_SITE_KEY ? (
          <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} />
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-6">
          <SubmitButton pendingLabel="送出中…">
            {willAutoPublish ? "送出並發表" : "送出待審"}
          </SubmitButton>
          <p className="text-xs text-[var(--muted-ink)]">
            送出代表你同意內容將以你的身份顯示，並可被其他使用者閱讀、留言。
          </p>
        </div>
      </form>
    </div>
  )
}
