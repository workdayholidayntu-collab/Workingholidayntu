// Per SECURITY.md §6.1 / §9.6: throttle freshly-registered accounts to limit
// spam blast radius. Returns null when within limits, or a human-readable
// reason when the user must back off.

import type { SupabaseClient } from "@supabase/supabase-js"

const ONE_DAY_MS = 24 * 60 * 60 * 1000

interface NewUserLimit {
  table: "posts" | "comments"
  limit: number
  label: string
}

const NEW_USER_LIMITS: Record<"post" | "comment", NewUserLimit> = {
  post: { table: "posts", limit: 3, label: "篇文章" },
  comment: { table: "comments", limit: 10, label: "則留言" },
}

export async function checkNewUserRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: "post" | "comment",
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at, trust_level")
    .eq("id", userId)
    .maybeSingle()

  if (!profile?.created_at) return null

  // Verified members (trust_level >= 1) skip the new-user throttle.
  if ((profile.trust_level ?? 0) >= 1) return null

  const ageMs = Date.now() - new Date(profile.created_at).getTime()
  if (ageMs >= ONE_DAY_MS) return null

  const { table, limit, label } = NEW_USER_LIMITS[action]
  const since = new Date(Date.now() - ONE_DAY_MS).toISOString()
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("created_at", since)

  if ((count ?? 0) >= limit) {
    return `新註冊 24 小時內每日上限 ${limit} ${label}，請明天再試。`
  }

  return null
}
