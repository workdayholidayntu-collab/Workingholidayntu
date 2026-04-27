import type { MetadataRoute } from "next"
import { getApprovedPosts, getCountries } from "@/lib/data"
import { buildUrl } from "@/lib/utils"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, countries] = await Promise.all([getApprovedPosts(), getCountries()])

  const staticEntries: MetadataRoute.Sitemap = [
    { url: buildUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: buildUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: buildUrl("/countries"), changeFrequency: "weekly", priority: 0.8 },
    { url: buildUrl("/search"), changeFrequency: "monthly", priority: 0.4 },
  ]

  const countryEntries: MetadataRoute.Sitemap = countries.map((country) => ({
    url: buildUrl(`/countries/${country.slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: buildUrl(`/posts/${post.slug}`),
    lastModified: new Date(post.updated_at),
    changeFrequency: "weekly",
    priority: 0.9,
  }))

  return [...staticEntries, ...countryEntries, ...postEntries]
}
