import { CountryFilter } from "@/components/country/country-filter"
import { PostCard, PostCardFeatured } from "@/components/post/post-card"
import { getApprovedPosts, getCountries, getProfiles } from "@/lib/data"

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const activeCountry = typeof params.country === "string" ? params.country : undefined

  const [countries, posts, profiles] = await Promise.all([
    getCountries(),
    getApprovedPosts(activeCountry),
    getProfiles(),
  ])

  const [featuredPost, ...restPosts] = posts
  const featuredCountry = featuredPost
    ? countries.find((country) => country.slug === featuredPost.country_slug)
    : undefined
  const featuredAuthor = featuredPost
    ? profiles.find((profile) => profile.id === featuredPost.author_id)
    : undefined

  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="pt-4 pb-2 sm:pt-8 sm:pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--brand)]">
          Borderless Habitat
        </p>
        <h1 className="heading-editorial mt-4 whitespace-nowrap text-[clamp(0.95rem,3.5vw,2.5rem)] text-[var(--ink)]">
          讓每個回來的人，成為下一個出發者的底氣。
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted-ink)]">
          棲地無界整理台灣人海外打工度假的第一手經驗：簽證、找工、住宿、社交。
          每一篇都是過來人的真實經驗和心血。
        </p>
      </section>

      <section>
        <CountryFilter countries={countries} activeSlug={activeCountry} />
      </section>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--sand)]/40 px-6 py-12 text-center text-sm text-[var(--muted-ink)]">
          這個國家目前還沒有過來人故事，我們正在整理中。
        </div>
      ) : (
        <>
          {featuredPost ? (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                最新訪談
              </p>
              <div className="mt-3">
                <PostCardFeatured
                  post={featuredPost}
                  country={featuredCountry}
                  author={featuredAuthor}
                />
              </div>
            </section>
          ) : null}

          {restPosts.length > 0 ? (
            <section className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                其他過來人故事
              </p>
              <div className="grid gap-5">
                {restPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    country={countries.find((c) => c.slug === post.country_slug)}
                    author={profiles.find((p) => p.id === post.author_id)}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
