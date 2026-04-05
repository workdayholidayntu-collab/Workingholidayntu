import { CountryHero } from "@/components/country/country-hero"
import { CountryNav } from "@/components/country/country-nav"
import { PostCard } from "@/components/post/post-card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getApprovedPosts, getCountries, getHelpersByCountry, getProfiles, requireCountry } from "@/lib/data"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const country = await requireCountry(slug)

  return {
    title: `${country.name_zh} 打工度假知識庫`,
    description: `在棲地無界查看 ${country.name_zh} 的簽證、預算、文章與過來人協助。`,
  }
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [country, countries, countryPosts, mentors, profiles] = await Promise.all([
    requireCountry(slug),
    getCountries(),
    getApprovedPosts(slug),
    getHelpersByCountry(slug),
    getProfiles(),
  ])

  return (
    <div className="space-y-8">
      <CountryNav countries={countries} activeSlug={country.slug} />
      <CountryHero country={country} />
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <Badge>過來人文章</Badge>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)]">{country.name_zh} 的最新實戰筆記</h2>
            </div>
          </div>
          <div className="grid gap-4">
            {countryPosts.map((post) => (
              <PostCard key={post.id} post={post} country={country} author={profiles.find((profile) => profile.id === post.author_id)} />
            ))}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>可以先向誰請教</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mentors.length === 0 ? (
              <p className="text-sm leading-7 text-[var(--muted-ink)]">這個國家目前還沒有公開的過來人卡片，歡迎你成為第一位補上經驗的人。</p>
            ) : (
              mentors.map((mentor) => (
                <div key={mentor.id} className="rounded-[24px] border border-[var(--line)] bg-white/70 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={mentor.nickname} />
                    <div>
                      <p className="font-semibold text-[var(--ink)]">{mentor.nickname}</p>
                      <p className="text-sm text-[var(--muted-ink)]">{mentor.bio}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">{mentor.can_help}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
