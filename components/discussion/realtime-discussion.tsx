"use client"

import { useEffect, useMemo, useState } from "react"
import { MessageCircleMore, SendHorizonal } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import type { Discussion } from "@/types"

export function RealtimeDiscussion({
  postId,
  initialDiscussions,
  currentUserId,
  currentNickname,
}: {
  postId: string
  initialDiscussions: Discussion[]
  currentUserId: string | null
  currentNickname: string | null
}) {
  const [items, setItems] = useState(initialDiscussions)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  function appendDiscussion(discussion: Discussion) {
    setItems((current) => (current.some((item) => item.id === discussion.id) ? current : [...current, discussion]))
  }

  useEffect(() => {
    if (!supabase || !hasSupabaseEnv) return

    const channel = supabase
      .channel(`discussion:${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "discussions", filter: `post_id=eq.${postId}` },
        async (payload: { new: unknown }) => {
          const row = payload.new as Discussion
          const { data: profile } = await supabase
            .from("profiles")
            .select("nickname, avatar_url, is_verified")
            .eq("id", row.user_id)
            .maybeSingle()

          appendDiscussion({
            ...row,
            profile:
              profile && "nickname" in profile
                ? { nickname: profile.nickname, avatar_url: profile.avatar_url, is_verified: profile.is_verified }
                : undefined,
          })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [postId, supabase])

  async function handleSubmit() {
    const value = content.trim()
    if (!value || !currentUserId) return

    if (!supabase || !hasSupabaseEnv) {
      setItems((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          post_id: postId,
          user_id: currentUserId,
          content: value,
          created_at: new Date().toISOString(),
          profile: { nickname: currentNickname, avatar_url: null, is_verified: false },
        },
      ])
      setContent("")
      return
    }

    setSubmitting(true)
    const { error } = await supabase.from("discussions").insert({ post_id: postId, user_id: currentUserId, content: value })
    if (!error) setContent("")
    setSubmitting(false)
  }

  return (
      <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircleMore className="h-5 w-5 text-[var(--brand)]" />
          討論區
        </CardTitle>
        <span className="text-xs text-[var(--muted-ink)]">有經驗可以補充？留言幫到下一位出發者。</span>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-[24px] bg-[var(--sand)] p-4 text-sm text-[var(--muted-ink)]">還沒有留言。成為第一個幫下一位出發者補上細節的人。</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-[24px] border border-[var(--line)] bg-white/80 p-4">
                <Avatar className="h-10 w-10 text-xs" name={item.profile?.nickname ?? "旅人"} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--ink)]">{item.profile?.nickname ?? "棲地無界社群"}</p>
                    <p className="text-xs text-[var(--muted-ink)]">{formatDate(item.created_at)}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted-ink)]">{item.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="space-y-3">
          <Textarea
            placeholder={currentUserId ? "分享你的經驗或補充細節，幫助下一位出發者。" : "登入後即可留言。"}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={!currentUserId || submitting}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={!currentUserId || submitting || !content.trim()} className="gap-2">
              <SendHorizonal className="h-4 w-4" />
              {submitting ? "送出中..." : "送出留言"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
