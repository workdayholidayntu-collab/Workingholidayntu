import Link from "next/link"
import { CountryNav } from "@/components/country/country-nav"
import { PostCard } from "@/components/post/post-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getApprovedPosts, getCountries, getProfiles } from "@/lib/data"

export const metadata = { title: "國家知識庫" }

export default async function CountriesPage() {
  const [countries, posts, profiles] = await Promise.all([getCountries(), getApprovedPosts(), getProfiles()])

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand)]">18 國知識庫</p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">選一個國家，開始你的打工度假準備。</h1>
        <p className="max-w-3xl text-base leading-8 text-[var(--muted-ink)]">
          棲地無界把簽證、預算、住宿、求職與人脈建議收斂成固定模板，讓你不必在 FB、論壇與私人筆記之間來回拼湊。
        </p>
        <CountryNav countries={countries} />
        <div className="grid gap-4 md:grid-cols-3">
          <QuickStart
            title="還沒決定國家"
            description="先從簽證年齡、預算與停留時間比對，找出最適合你目前人生節奏的目的地。"
          />
          <QuickStart
            title="已經鎖定目的地"
            description="直接進國家頁，把申請步驟、落地預算與最新實戰文章一起看。"
          />
          <QuickStart
            title="想找過來人"
            description="國家頁右側會把已公開的過來人卡片一起整理出來，方便你快速判斷誰最能幫到你。"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {countries.map((country) => (
          <Card key={country.slug}>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl">{country.flag_emoji}</p>
                  <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">{country.name_zh}</h2>
                  <p className="text-sm text-[var(--muted-ink)]">{country.name_en}</p>
                </div>
                <Badge>{country.visa_info.processingTime}</Badge>
              </div>
              <p className="text-sm leading-7 text-[var(--muted-ink)]">{country.visa_info.overview}</p>
              <Link className="text-sm font-semibold text-[var(--brand)]" href={`/countries/${country.slug}`}>
                進入 {country.name_zh} 知識庫
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)]">最新文章</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              country={countries.find((country) => country.slug === post.country_slug)}
              author={profiles.find((profile) => profile.id === post.author_id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function QuickStart({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card className="bg-white/70">
      <CardContent className="space-y-2 p-5">
        <h2 className="font-semibold text-[var(--ink)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-ink)]">{description}</p>
      </CardContent>
    </Card>
  )
}
