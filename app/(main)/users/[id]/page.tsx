import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PostListItem } from "@/components/post/post-card"
import { getCountries, getPostsByAuthor, getProfileById } from "@/lib/data"
import { buildUrl, formatDate } from "@/lib/utils"

interface UserPageParams {
  id: string
}

interface UserPageProps {
  params: Promise<UserPageParams>
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { id } = await params
  const profile = await getProfileById(id)
  if (!profile) return { title: "找不到使用者" }

  const description = profile.bio ?? `${profile.nickname} 在棲地無界分享的打工度假經驗。`
  const url = buildUrl(`/users/${profile.id}`)

  return {
    title: profile.nickname,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title: profile.nickname,
      description,
      url,
      locale: "zh_TW",
    },
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params
  const profile = await getProfileById(id)
  if (!profile) notFound()

  const [posts, countries] = await Promise.all([getPostsByAuthor(id), getCountries()])
  const countryMap = new Map(countries.map((country) => [country.slug, country]))

  return (
    <div className="space-y-12">
      <header className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--brand)]">
            過來人 · Profile
          </p>
          <div className="mt-3 flex items-center gap-4">
            <Avatar className="h-14 w-14" name={profile.nickname} />
            <div>
              <h1 className="heading-editorial flex items-center gap-2 text-[clamp(1.8rem,3vw,2.4rem)] text-[var(--ink)]">
                {profile.nickname}
                {profile.trust_level >= 1 ? (
                  <CheckCircle2
                    className="h-5 w-5 text-[var(--brand)]"
                    aria-label="已驗證"
                  />
                ) : null}
              </h1>
              <p className="mt-1 text-xs text-[var(--muted-ink)]">
                加入棲地無界 · {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          {profile.bio ? (
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--ink)]">{profile.bio}</p>
          ) : null}
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-[var(--line)] pt-4 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
          <dt className="text-xs uppercase tracking-wider text-[var(--muted-ink)]">已發表</dt>
          <dd className="font-editorial text-2xl font-bold text-[var(--ink)]">
            {posts.length}
            <span className="ml-1 text-sm font-normal text-[var(--muted-ink)]">篇</span>
          </dd>
          <dt className="text-xs uppercase tracking-wider text-[var(--muted-ink)]">去過國家</dt>
          <dd className="font-editorial text-2xl font-bold text-[var(--ink)]">
            {profile.countries_visited.length}
            <span className="ml-1 text-sm font-normal text-[var(--muted-ink)]">國</span>
          </dd>
        </dl>
      </header>

      {profile.can_help ? (
        <section className="border-t border-[var(--line)] pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
            可以幫忙
          </p>
          <p className="mt-2 max-w-2xl text-base leading-7 text-[var(--ink)]">{profile.can_help}</p>
        </section>
      ) : null}

      {profile.countries_visited.length > 0 ? (
        <section className="border-t border-[var(--line)] pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
            去過的國家
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.countries_visited.map((slug) => {
              const country = countryMap.get(slug)
              return (
                <Badge key={slug} className="bg-[var(--sky-light)]">
                  {country ? `${country.flag_emoji} ${country.name_zh}` : slug}
                </Badge>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="border-t border-[var(--line)] pt-6">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
            已發表文章
          </p>
          <span className="text-xs text-[var(--muted-ink)]">{posts.length} 篇</span>
        </div>

        {posts.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted-ink)]">這位使用者尚未發表任何文章。</p>
        ) : (
          <div className="mt-3">
            {posts.map((post) => (
              <PostListItem
                key={post.id}
                post={post}
                country={post.country_slug ? countryMap.get(post.country_slug) : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
