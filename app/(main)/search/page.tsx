import Link from "next/link"
import { Earth, FileText, Tag, UserRound, X } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getTopTags, searchPlatform } from "@/lib/data"

export const metadata = { title: "搜尋" }

function buildSearchHref({ q, tag }: { q?: string; tag?: string }): string {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (tag) params.set("tag", tag)
  const qs = params.toString()
  return qs ? `/search?${qs}` : "/search"
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = typeof params.q === "string" ? params.q : ""
  const tag = typeof params.tag === "string" ? params.tag : ""
  const [results, topTags] = await Promise.all([
    searchPlatform({ query, tag }),
    getTopTags(),
  ])

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand)]">Search</p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">從國家、文章、過來人三條線一起找答案。</h1>
        <form className="max-w-2xl" action="/search">
          <Input name="q" defaultValue={query} placeholder="輸入國家、主題、人物，例如：澳洲 求職" />
          {tag ? <input type="hidden" name="tag" value={tag} /> : null}
        </form>
        {tag ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)]/10 px-4 py-2 font-semibold text-[var(--brand)]">
              <Tag className="h-3.5 w-3.5" />
              標籤：#{tag}
            </span>
            <Link
              href={buildSearchHref({ q: query })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-ink)] hover:text-[var(--ink)]"
            >
              <X className="h-3 w-3" />
              清除標籤
            </Link>
          </div>
        ) : null}
        {topTags.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
              熱門標籤
            </p>
            <div className="flex flex-wrap gap-2">
              {topTags.map(({ tag: topTag, count }) => {
                const active = topTag.toLowerCase() === tag.toLowerCase()
                return (
                  <Link
                    key={topTag}
                    href={buildSearchHref({ q: query, tag: active ? undefined : topTag })}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                        : "border-[var(--line)] bg-[var(--card)] text-[var(--muted-ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                    }`}
                  >
                    #{topTag}
                    <span className={`ml-1.5 ${active ? "text-white/80" : "text-[var(--muted-ink)]/70"}`}>
                      {count}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* ── Country cards: flag prominent ── */}
        <ResultColumn icon={Earth} title="國家" count={results.countries.length} accentColor="var(--sky-light)">
          {results.countries.length === 0 ? <EmptyState label="還沒有符合的國家結果" /> : null}
          {results.countries.map((country) => (
            <Link key={country.slug} href={`/countries/${country.slug}`} className="group block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{country.flag_emoji}</span>
                <div>
                  <p className="font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">{country.name_zh}</p>
                  <p className="text-sm text-[var(--muted-ink)]">{country.name_en}</p>
                </div>
              </div>
            </Link>
          ))}
        </ResultColumn>

        {/* ── Post cards: left color bar ── */}
        <ResultColumn icon={FileText} title="文章" count={results.posts.length} accentColor="var(--sky-mid)">
          {results.posts.length === 0 ? <EmptyState label="還沒有符合的文章結果" /> : null}
          {results.posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex">
                <div className="w-1.5 shrink-0 bg-gradient-to-b from-[var(--sky-mid)] to-[var(--sky-deep)]" />
                <div className="p-4">
                  <p className="font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">{post.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-ink)] line-clamp-2">{post.excerpt}</p>
                </div>
              </div>
            </Link>
          ))}
        </ResultColumn>

        {/* ── Profile cards: avatar placeholder ── */}
        <ResultColumn icon={UserRound} title="過來人" count={results.profiles.length} accentColor="var(--sky-dusk)">
          {results.profiles.length === 0 ? <EmptyState label="目前沒有符合的過來人卡片" /> : null}
          {results.profiles.map((profile) => (
            <div key={profile.id} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0 text-xs" name={profile.nickname} />
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--ink)]">{profile.nickname}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-ink)]">{profile.can_help}</p>
                </div>
              </div>
            </div>
          ))}
        </ResultColumn>
      </section>
    </div>
  )
}

function ResultColumn({
  icon: Icon,
  title,
  count,
  accentColor,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  count: number
  accentColor: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: accentColor }}>
            <Icon className="h-4 w-4 text-[var(--ink)]" />
          </div>
          <span className="flex-1 text-lg">{title}</span>
          <span className="text-sm font-medium text-[var(--muted-ink)]">{count}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--sand)]/45 p-4 text-sm leading-6 text-[var(--muted-ink)]">
      {label}
    </div>
  )
}
