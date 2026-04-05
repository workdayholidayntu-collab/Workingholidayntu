import Link from "next/link"
import { Earth, FileText, UserRound } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { searchPlatform } from "@/lib/data"

export const metadata = { title: "搜尋" }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = typeof params.q === "string" ? params.q : ""
  const results = await searchPlatform(query)

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand)]">Search</p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">從國家、文章、過來人三條線一起找答案。</h1>
        <form className="max-w-2xl">
          <Input name="q" defaultValue={query} placeholder="輸入國家、主題、人物，例如：澳洲 求職" />
        </form>
        <div className="flex flex-wrap gap-2">
          {["澳洲 農場", "日本 住宿", "紐西蘭 預算", "加拿大 履歷"].map((suggestion) => (
            <Link
              key={suggestion}
              href={`/search?q=${encodeURIComponent(suggestion)}`}
              className="rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--muted-ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {suggestion}
            </Link>
          ))}
        </div>
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
