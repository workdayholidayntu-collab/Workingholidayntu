import Link from "next/link"
import { getApprovedPosts, getCountries } from "@/lib/data"

export const metadata = {
  title: "國家知識庫 — 棲地無界 Borderless Habitat",
  description: "台灣人打工度假目的地一覽：簽證條件、預算建議與申請步驟。",
}

export default async function CountriesPage() {
  const [countries, posts] = await Promise.all([getCountries(), getApprovedPosts()])

  const postCountByCountry = new Map<string, number>()
  for (const post of posts) {
    if (!post.country_slug) continue
    postCountByCountry.set(post.country_slug, (postCountByCountry.get(post.country_slug) ?? 0) + 1)
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
          國家知識庫
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-ink)]">
          台灣與 {countries.length} 個國家簽有打工度假協定，選擇一個國家查看簽證條件與過來人經驗。
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {countries.map((country) => {
          const count = postCountByCountry.get(country.slug) ?? 0
          return (
            <Link
              key={country.slug}
              href={`/countries/${country.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-3xl">{country.flag_emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[var(--ink)] group-hover:text-[var(--brand)]">
                  {country.name_zh}
                  <span className="ml-2 text-sm font-normal text-[var(--muted-ink)]">{country.name_en}</span>
                </p>
                <p className="mt-1 text-sm text-[var(--muted-ink)]">
                  {country.visa_info.ageRange} · {country.visa_info.stayDuration}
                </p>
                {count > 0 && (
                  <p className="mt-2 text-xs font-medium text-[var(--brand)]">
                    {count} 篇過來人故事
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
