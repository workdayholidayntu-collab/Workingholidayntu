import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { updateProfileAction } from "@/app/actions"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SubmitButton } from "@/components/ui/submit-button"
import { getCountries, getCurrentViewer, getOwnPosts } from "@/lib/data"
import { formatDate } from "@/lib/utils"
import type { Post, PostStatus } from "@/types"

export const metadata = { title: "個人後台" }

interface ProfilePageProps {
  searchParams: Promise<{ welcome?: string; saved?: string; error?: string }>
}

const fieldLabel =
  "block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-ink)]"
const fieldInput =
  "w-full border-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-ink)]/60 focus:border-[var(--brand)]"

const statusLabel: Record<PostStatus, string> = {
  draft: "草稿",
  pending: "待審",
  approved: "已刊出",
  rejected: "退稿",
  hidden: "已隱藏",
}

const statusTone: Record<PostStatus, string> = {
  draft: "bg-white text-[var(--muted-ink)]",
  pending: "bg-[var(--sand)] text-[var(--brand)]",
  approved: "bg-[var(--sky-light)] text-[var(--ink)]",
  rejected: "bg-red-50 text-red-700",
  hidden: "bg-zinc-100 text-zinc-500",
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const [{ welcome, saved, error }, viewer, countries] = await Promise.all([
    searchParams,
    getCurrentViewer(),
    getCountries(),
  ])

  if (!viewer.userId) {
    redirect("/login?error=" + encodeURIComponent("請先登入"))
  }

  const profile = viewer.profile
  const ownPosts = profile ? await getOwnPosts(viewer.userId) : []
  const countryMap = new Map(countries.map((country) => [country.slug, country]))

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--brand)]">
          你的後台 · Borderless Habitat
        </p>
        <h1 className="heading-editorial text-[clamp(2rem,4vw,3rem)] text-[var(--ink)]">
          {profile?.nickname ?? "嗨"}，把你走過的路，<br className="hidden sm:block" />
          整理成下一個出發者用得上的線索。
        </h1>
        {profile ? (
          <p className="text-xs text-[var(--muted-ink)]">
            加入棲地無界 · {formatDate(profile.created_at)}
          </p>
        ) : null}
      </header>

      {welcome ? (
        <div className="border-l-2 border-[var(--brand)] bg-[var(--sand)]/60 px-4 py-3 text-sm text-[var(--ink)]">
          歡迎加入棲地無界！先把你的個人資料填好，下一位出發者會用得上。
        </div>
      ) : null}

      {saved ? (
        <div className="border-l-2 border-emerald-400 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
          個人資料已更新。
        </div>
      ) : null}

      {error ? (
        <div className="border-l-2 border-red-400 bg-red-50/70 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      ) : null}

      <section className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <ProfileCard
          nickname={profile?.nickname ?? viewer.email ?? "新朋友"}
          email={viewer.email}
          trustLevel={profile?.trust_level ?? 0}
          bio={profile?.bio}
          canHelp={profile?.can_help}
          countryLabels={
            profile?.countries_visited.map(
              (slug) => countryMap.get(slug)?.name_zh ?? slug,
            ) ?? []
          }
        />

        <form action={updateProfileAction} className="space-y-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
            編輯資料
          </p>

          <div className="space-y-2">
            <label htmlFor="nickname" className={fieldLabel}>暱稱</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              minLength={2}
              maxLength={30}
              defaultValue={profile?.nickname ?? ""}
              className={fieldInput}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className={fieldLabel}>自我介紹（≤ 240 字）</label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={240}
              placeholder="幾句話介紹你的打工度假經驗。"
              defaultValue={profile?.bio ?? ""}
              className={`${fieldInput} resize-y`}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="canHelp" className={fieldLabel}>可以幫忙（≤ 240 字）</label>
            <textarea
              id="canHelp"
              name="canHelp"
              rows={2}
              maxLength={240}
              placeholder="如：J-1 行前準備、簽證面試、阿拉斯加生活⋯"
              defaultValue={profile?.can_help ?? ""}
              className={`${fieldInput} resize-y`}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="countriesVisited" className={fieldLabel}>
              去過的國家 slug（用逗號分隔）
            </label>
            <input
              id="countriesVisited"
              name="countriesVisited"
              type="text"
              placeholder="如：usa, france"
              defaultValue={profile?.countries_visited.join(", ") ?? ""}
              className={fieldInput}
            />
            <p className="text-[11px] text-[var(--muted-ink)]">
              目前可用：{countries.map((c) => c.slug).join("、")}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton pendingLabel="儲存中…">儲存資料</SubmitButton>
            <Link
              href="/posts/new"
              className="text-sm font-semibold text-[var(--muted-ink)] transition hover:text-[var(--ink)]"
            >
              撰寫新故事 →
            </Link>
          </div>
        </form>
      </section>

      <section className="border-t border-[var(--line)] pt-8">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
            你的文章
          </p>
          <span className="text-xs text-[var(--muted-ink)]">{ownPosts.length} 篇</span>
        </div>

        {ownPosts.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted-ink)]">
            還沒有任何文章。{" "}
            <Link
              href="/posts/new"
              className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline"
            >
              現在寫一篇
            </Link>
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)]">
            {ownPosts.map((post) => (
              <OwnPostRow
                key={post.id}
                post={post}
                countryLabel={
                  post.country_slug
                    ? countryMap.get(post.country_slug)?.name_zh ?? post.country_slug
                    : null
                }
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

interface ProfileCardProps {
  nickname: string
  email: string | null
  trustLevel: number
  bio?: string | null
  canHelp?: string | null
  countryLabels: string[]
}

function ProfileCard({
  nickname,
  email,
  trustLevel,
  bio,
  canHelp,
  countryLabels,
}: ProfileCardProps) {
  return (
    <aside className="space-y-5 rounded-3xl bg-[var(--sand)] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14" name={nickname} />
        <div className="min-w-0">
          <p className="heading-editorial flex items-center gap-2 text-xl text-[var(--ink)]">
            {nickname}
            {trustLevel >= 1 ? (
              <CheckCircle2
                className="h-4 w-4 text-[var(--brand)]"
                aria-label="已驗證"
              />
            ) : null}
          </p>
          {email ? (
            <p className="mt-0.5 truncate text-xs text-[var(--muted-ink)]">{email}</p>
          ) : null}
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--brand)]">
            信任等級 Lv {trustLevel}
            <span className="ml-2 text-[var(--muted-ink)]">
              {trustLevel >= 1 ? "發文直接刊出" : "發文需審核"}
            </span>
          </p>
        </div>
      </div>

      {bio ? (
        <p className="text-sm leading-7 text-[var(--ink)]">{bio}</p>
      ) : (
        <p className="text-sm text-[var(--muted-ink)]">
          尚未填寫自我介紹。下一位出發者更想知道是誰寫的。
        </p>
      )}

      {canHelp ? (
        <div className="rounded-2xl bg-white/70 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
            可以幫忙
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--ink)]">{canHelp}</p>
        </div>
      ) : null}

      {countryLabels.length > 0 ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
            去過的國家
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {countryLabels.map((label) => (
              <Badge key={label} className="bg-white">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  )
}

interface OwnPostRowProps {
  post: Post
  countryLabel: string | null
}

function OwnPostRow({ post, countryLabel }: OwnPostRowProps) {
  return (
    <li className="flex flex-wrap items-baseline gap-3 py-4">
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${statusTone[post.status]}`}
      >
        {statusLabel[post.status]}
      </span>
      {countryLabel ? (
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">
          {countryLabel}
        </span>
      ) : null}
      {post.status === "approved" ? (
        <Link
          href={`/posts/${post.slug}`}
          className="heading-editorial flex-1 text-base text-[var(--ink)] hover:text-[var(--brand)] sm:text-lg"
        >
          {post.title}
        </Link>
      ) : (
        <span className="heading-editorial flex-1 text-base text-[var(--ink)] sm:text-lg">
          {post.title}
        </span>
      )}
      <time className="hidden shrink-0 text-xs text-[var(--muted-ink)] sm:block">
        {formatDate(post.created_at)}
      </time>
    </li>
  )
}
