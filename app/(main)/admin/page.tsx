import Link from "next/link"
import { redirect } from "next/navigation"
import {
  setPostStatusAction,
  setReportStatusAction,
  setTrustLevelAction,
} from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  getCurrentViewer,
  getPendingPosts,
  getPendingReports,
  getProfiles,
} from "@/lib/data"
import { formatDate } from "@/lib/utils"

export const metadata = {
  title: "審查後台",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const viewer = await getCurrentViewer()

  if (!viewer.userId) {
    redirect("/login?error=" + encodeURIComponent("請先登入"))
  }
  if ((viewer.profile?.trust_level ?? 0) < 3) {
    redirect("/?error=" + encodeURIComponent("沒有權限"))
  }

  const [pendingPosts, pendingReports, profiles] = await Promise.all([
    getPendingPosts(),
    getPendingReports(),
    getProfiles(),
  ])

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--brand)]">
          審查後台 · Admin
        </p>
        <h1 className="heading-editorial text-[clamp(2rem,4vw,2.8rem)] text-[var(--ink)]">
          每天 30 分鐘，把社群守住。
        </h1>
        <p className="text-sm text-[var(--muted-ink)]">
          僅 trust_level=3 的團隊成員可進入此頁。所有操作會回寫到 Supabase 並寫入 audit。
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="heading-editorial text-xl text-[var(--ink)]">
            待審文章
          </h2>
          <span className="text-xs text-[var(--muted-ink)]">{pendingPosts.length} 篇</span>
        </div>

        {pendingPosts.length === 0 ? (
          <p className="text-sm text-[var(--muted-ink)]">目前沒有待審文章。</p>
        ) : (
          <ul className="space-y-3">
            {pendingPosts.map((post) => (
              <li
                key={post.id}
                className="rounded-2xl border border-[var(--line)] bg-white/80 p-5"
              >
                <div className="flex flex-wrap items-baseline gap-3 text-xs text-[var(--muted-ink)]">
                  <span className="font-semibold text-[var(--ink)]">
                    {post.author?.nickname ?? post.author_display_name ?? "(匿名)"}
                  </span>
                  <span>Lv {post.author?.trust_level ?? 0}</span>
                  <time>{formatDate(post.created_at)}</time>
                  {post.country_slug ? <span>· {post.country_slug}</span> : null}
                </div>
                <Link
                  href={`/posts/${post.slug}`}
                  className="heading-editorial mt-2 block text-lg text-[var(--ink)] hover:text-[var(--brand)]"
                >
                  {post.title}
                </Link>
                {post.excerpt ? (
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">
                    {post.excerpt}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={setPostStatusAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="status" value="approved" />
                    <Button type="submit" className="!px-3 !py-1.5 !text-xs">
                      通過刊出
                    </Button>
                  </form>
                  <form action={setPostStatusAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <Button type="submit" variant="outline" className="!px-3 !py-1.5 !text-xs">
                      退稿
                    </Button>
                  </form>
                  <form action={setPostStatusAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="status" value="hidden" />
                    <Button type="submit" variant="ghost" className="!px-3 !py-1.5 !text-xs">
                      隱藏
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="heading-editorial text-xl text-[var(--ink)]">待處理檢舉</h2>
          <span className="text-xs text-[var(--muted-ink)]">{pendingReports.length} 件</span>
        </div>

        {pendingReports.length === 0 ? (
          <p className="text-sm text-[var(--muted-ink)]">目前沒有待處理的檢舉。</p>
        ) : (
          <ul className="space-y-3">
            {pendingReports.map((report) => (
              <li
                key={report.id}
                className="rounded-2xl border border-[var(--line)] bg-white/80 p-5"
              >
                <div className="flex flex-wrap items-baseline gap-3 text-xs text-[var(--muted-ink)]">
                  <span className="rounded-full bg-[var(--sand)] px-2 py-0.5 font-semibold text-[var(--brand)]">
                    {report.target_type === "post" ? "文章" : "留言"}
                  </span>
                  <span>來自 {report.reporter?.nickname ?? "(匿名)"}</span>
                  <time>{formatDate(report.created_at)}</time>
                </div>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                  {report.target_link ? (
                    <Link href={report.target_link} className="hover:text-[var(--brand)]">
                      {report.target_summary}
                    </Link>
                  ) : (
                    report.target_summary
                  )}
                </p>
                <p className="mt-2 rounded-xl bg-[var(--sand)]/60 px-3 py-2 text-xs leading-6 text-[var(--ink)]">
                  {report.reason}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={setReportStatusAction}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="status" value="resolved" />
                    <Button type="submit" className="!px-3 !py-1.5 !text-xs">
                      已處理（resolve）
                    </Button>
                  </form>
                  <form action={setReportStatusAction}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="status" value="dismissed" />
                    <Button type="submit" variant="outline" className="!px-3 !py-1.5 !text-xs">
                      無效（dismiss）
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="heading-editorial text-xl text-[var(--ink)]">調整使用者信任等級</h2>
        <p className="text-xs text-[var(--muted-ink)]">
          0=新手（發文需審）、1=一般（自動刊出）、2=資深、3=團隊（admin）。
        </p>

        <ul className="divide-y divide-[var(--line)]">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className="grid gap-3 py-3 sm:grid-cols-[1.4fr_1fr_auto] sm:items-center"
            >
              <div>
                <Link
                  href={`/users/${profile.id}`}
                  className="font-semibold text-[var(--ink)] hover:text-[var(--brand)]"
                >
                  {profile.nickname}
                </Link>
                <p className="text-[11px] text-[var(--muted-ink)]">
                  加入 {formatDate(profile.created_at)}
                </p>
              </div>
              <span className="text-xs text-[var(--muted-ink)]">
                目前：Lv {profile.trust_level}
              </span>
              <form action={setTrustLevelAction} className="flex items-center gap-2">
                <input type="hidden" name="userId" value={profile.id} />
                <select
                  name="trustLevel"
                  defaultValue={profile.trust_level}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs"
                >
                  <option value={0}>0 · 新手</option>
                  <option value={1}>1 · 一般</option>
                  <option value={2}>2 · 資深</option>
                  <option value={3}>3 · 團隊</option>
                </select>
                <Button type="submit" variant="outline" className="!px-3 !py-1.5 !text-xs">
                  套用
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
