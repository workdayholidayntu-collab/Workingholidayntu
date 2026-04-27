import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { markdownLikeParagraphs, sanitizeHtmlFragment } from "@/lib/utils"
import type { Comment, Country, Post, Profile, Viewer } from "@/types"

export async function getCountries(): Promise<Country[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("countries").select("*").order("name_zh")
  if (error) throw error
  return (data as Country[]) ?? []
}

export async function getCountryBySlug(slug: string): Promise<Country | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("countries").select("*").eq("slug", slug).maybeSingle()
  if (error) throw error
  return (data as Country | null) ?? null
}

export async function getApprovedPosts(countrySlug?: string): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  if (countrySlug) query = query.eq("country_slug", countrySlug)

  const { data, error } = await query
  if (error) throw error
  return (data as Post[]) ?? []
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle()
  if (error) throw error
  return (data as Post | null) ?? null
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const supabase = await createSupabaseServerClient()
  const { data: rows, error } = await supabase
    .from("comments")
    .select("id, post_id, author_id, parent_id, content, status, created_at")
    .eq("post_id", postId)
    .eq("status", "visible")
    .order("created_at")
  if (error) throw error

  const commentRows = (rows as Comment[]) ?? []
  if (commentRows.length === 0) return []

  const ids = Array.from(new Set(commentRows.map((item) => item.author_id)))
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, trust_level")
    .in("id", ids)

  const profileMap = new Map(
    ((profileRows as Array<Pick<Profile, "id" | "nickname" | "avatar_url" | "trust_level">>) ?? []).map(
      (profile) => [profile.id, profile],
    ),
  )

  return commentRows.map((item) => {
    const profile = profileMap.get(item.author_id)
    return {
      ...item,
      profile: profile
        ? {
            nickname: profile.nickname,
            avatar_url: profile.avatar_url,
            trust_level: profile.trust_level,
          }
        : undefined,
    }
  })
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("profiles").select("*").order("created_at")
  if (error) throw error
  return (data as Profile[]) ?? []
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return (data as Profile | null) ?? null
}

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", authorId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as Post[]) ?? []
}

// All posts by author including pending/draft/rejected. RLS still scopes this
// to either the author themselves or admins (see posts_read_visible policy).
export async function getOwnPosts(authorId: string): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as Post[]) ?? []
}

export async function getHelpersByCountry(slug: string): Promise<Profile[]> {
  const allProfiles = await getProfiles()
  return allProfiles.filter((profile) => profile.countries_visited.includes(slug))
}

export async function getCurrentViewer(): Promise<Viewer> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { userId: null, email: null, profile: null }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: (profile as Profile | null) ?? null,
  }
}

export interface SearchOptions {
  query?: string
  tag?: string
}

export async function searchPlatform({ query = "", tag = "" }: SearchOptions = {}) {
  const keyword = query.trim().toLowerCase()
  const tagFilter = tag.trim().toLowerCase()
  const [allCountries, allPosts, allProfiles] = await Promise.all([
    getCountries(),
    getApprovedPosts(),
    getProfiles(),
  ])

  const matchesKeyword = (post: Post) =>
    !keyword ||
    `${post.title} ${post.excerpt ?? ""} ${post.tags.join(" ")}`.toLowerCase().includes(keyword)
  const matchesTag = (post: Post) =>
    !tagFilter || post.tags.some((entry) => entry.toLowerCase() === tagFilter)

  const countries = keyword
    ? allCountries.filter((country) =>
        `${country.name_zh} ${country.name_en}`.toLowerCase().includes(keyword),
      )
    : allCountries
  const profiles = keyword
    ? allProfiles.filter((profile) =>
        `${profile.nickname ?? ""} ${profile.bio ?? ""} ${profile.can_help ?? ""}`
          .toLowerCase()
          .includes(keyword),
      )
    : allProfiles
  const posts = allPosts.filter((post) => matchesKeyword(post) && matchesTag(post))

  return { countries, posts, profiles }
}

export async function getTopTags(limit = 18): Promise<Array<{ tag: string; count: number }>> {
  const posts = await getApprovedPosts()
  const counter = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) {
      const trimmed = tag.trim()
      if (!trimmed) continue
      counter.set(trimmed, (counter.get(trimmed) ?? 0) + 1)
    }
  }
  return Array.from(counter.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-Hant"))
    .slice(0, limit)
}

export async function requireCountry(slug: string): Promise<Country> {
  const country = await getCountryBySlug(slug)
  if (!country) notFound()
  return country
}

export async function requirePost(slug: string): Promise<Post> {
  const post = await getPostBySlug(slug)
  if (!post) notFound()
  return post
}

export function getPostBodyHtml(post: Post): string {
  return sanitizeHtmlFragment(post.html_content) || markdownLikeParagraphs(post.content)
}

// ----------------------------------------------------------------------------
// Admin queries — RLS allows trust_level=3 to read all rows.
// ----------------------------------------------------------------------------

export interface PendingPostRow extends Post {
  author?: Pick<Profile, "id" | "nickname" | "trust_level"> | null
}

export async function getPendingPosts(): Promise<PendingPostRow[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "pending")
    .order("created_at")

  if (error) throw error
  const posts = (data as Post[]) ?? []
  if (posts.length === 0) return []

  const authorIds = Array.from(
    new Set(posts.map((p) => p.author_id).filter((id): id is string => Boolean(id))),
  )
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, nickname, trust_level")
    .in("id", authorIds.length > 0 ? authorIds : ["00000000-0000-0000-0000-000000000000"])

  const profileMap = new Map(
    (profileRows ?? []).map((p) => [p.id, p as Pick<Profile, "id" | "nickname" | "trust_level">]),
  )

  return posts.map((post) => ({
    ...post,
    author: post.author_id ? profileMap.get(post.author_id) ?? null : null,
  }))
}

export interface PendingReportRow {
  id: string
  reason: string
  target_type: "post" | "comment"
  target_id: string
  status: "pending" | "resolved" | "dismissed"
  created_at: string
  reporter?: Pick<Profile, "id" | "nickname"> | null
  target_summary?: string
  target_link?: string | null
}

export async function getPendingReports(): Promise<PendingReportRow[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "pending")
    .order("created_at")

  if (error) throw error
  const rows = (data as Array<{
    id: string
    reporter_id: string
    reason: string
    target_type: "post" | "comment"
    target_id: string
    status: "pending" | "resolved" | "dismissed"
    created_at: string
  }>) ?? []
  if (rows.length === 0) return []

  const reporterIds = Array.from(new Set(rows.map((r) => r.reporter_id)))
  const { data: reporterRows } = await supabase
    .from("profiles")
    .select("id, nickname")
    .in("id", reporterIds)
  const reporterMap = new Map(
    (reporterRows ?? []).map((p) => [p.id, p as Pick<Profile, "id" | "nickname">]),
  )

  // Pre-fetch target summaries (post titles, comment excerpts).
  const postIds = rows.filter((r) => r.target_type === "post").map((r) => r.target_id)
  const commentIds = rows.filter((r) => r.target_type === "comment").map((r) => r.target_id)

  const [postSummaries, commentSummaries] = await Promise.all([
    postIds.length > 0
      ? supabase.from("posts").select("id, title, slug").in("id", postIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; slug: string }> }),
    commentIds.length > 0
      ? supabase.from("comments").select("id, content, post_id").in("id", commentIds)
      : Promise.resolve({ data: [] as Array<{ id: string; content: string; post_id: string }> }),
  ])

  const postSummaryMap = new Map(
    ((postSummaries.data ?? []) as Array<{ id: string; title: string; slug: string }>).map(
      (row) => [row.id, row],
    ),
  )

  const commentRows =
    ((commentSummaries.data ?? []) as Array<{ id: string; content: string; post_id: string }>) ?? []
  const commentPostIds = Array.from(new Set(commentRows.map((c) => c.post_id)))
  const { data: commentPostRows } = commentPostIds.length > 0
    ? await supabase.from("posts").select("id, slug").in("id", commentPostIds)
    : { data: [] as Array<{ id: string; slug: string }> }
  const commentPostSlugMap = new Map(
    ((commentPostRows ?? []) as Array<{ id: string; slug: string }>).map((row) => [row.id, row.slug]),
  )
  const commentSummaryMap = new Map(
    commentRows.map((row) => [
      row.id,
      {
        excerpt: row.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80),
        slug: commentPostSlugMap.get(row.post_id) ?? null,
      },
    ]),
  )

  return rows.map((row) => {
    if (row.target_type === "post") {
      const summary = postSummaryMap.get(row.target_id)
      return {
        id: row.id,
        reason: row.reason,
        target_type: row.target_type,
        target_id: row.target_id,
        status: row.status,
        created_at: row.created_at,
        reporter: reporterMap.get(row.reporter_id) ?? null,
        target_summary: summary?.title ?? "(已刪除文章)",
        target_link: summary ? `/posts/${summary.slug}` : null,
      }
    }
    const summary = commentSummaryMap.get(row.target_id)
    return {
      id: row.id,
      reason: row.reason,
      target_type: row.target_type,
      target_id: row.target_id,
      status: row.status,
      created_at: row.created_at,
      reporter: reporterMap.get(row.reporter_id) ?? null,
      target_summary: summary?.excerpt ?? "(已刪除留言)",
      target_link: summary?.slug ? `/posts/${summary.slug}#comments` : null,
    }
  })
}
