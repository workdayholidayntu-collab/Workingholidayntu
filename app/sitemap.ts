import type { MetadataRoute } from "next"
import { getApprovedPosts, getCountries } from "@/lib/data"
import { COUNTRIES_ENABLED } from "@/lib/features"
import { buildUrl } from "@/lib/utils"

export const revalidate = 3600

const STATIC_ENTRIES: MetadataRoute.Sitemap = [
  { url: buildUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: buildUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
  ...(COUNTRIES_ENABLED
    ? [{ url: buildUrl("/countries"), changeFrequency: "weekly" as const, priority: 0.8 }]
    : []),
  { url: buildUrl("/search"), changeFrequency: "monthly", priority: 0.4 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Tolerate missing Supabase env at build time (e.g. first Vercel deploy
  // before secrets are set) — return only the static skeleton so the build
  // doesn't fail. ISR will refresh with the full sitemap once env is present.
  try {
    const [posts, countries] = await Promise.all([
      getApprovedPosts(),
      COUNTRIES_ENABLED ? getCountries() : Promise.resolve([]),
    ])

    const countryEntries: MetadataRoute.Sitemap = COUNTRIES_ENABLED
      ? countries.map((country) => ({
          url: buildUrl(`/countries/${country.slug}`),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }))
      : []

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: buildUrl(`/posts/${post.slug}`),
      lastModified: new Date(post.updated_at),
      changeFrequency: "weekly",
      priority: 0.9,
    }))

    return [...STATIC_ENTRIES, ...countryEntries, ...postEntries]
  } catch {
    return STATIC_ENTRIES
  }
}
