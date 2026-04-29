import Link from "next/link"
import { createCommentAction, deleteCommentAction } from "@/app/actions"
import { Avatar } from "@/components/ui/avatar"
import { SubmitButton } from "@/components/ui/submit-button"
import { ReportButton } from "@/components/report/report-button"
import { sanitizeHtmlFragment, formatDate } from "@/lib/utils"
import type { Comment, Viewer } from "@/types"

interface CommentThreadProps {
  postId: string
  postSlug: string
  comments: Comment[]
  viewer: Viewer
}

export function CommentThread({ postId, postSlug, comments, viewer }: CommentThreadProps) {
  const tops = comments.filter((c) => c.parent_id === null)
  const replies = comments.filter((c) => c.parent_id !== null)
  const repliesByParent = new Map<string, Comment[]>()
  for (const reply of replies) {
    if (!reply.parent_id) continue
    const list = repliesByParent.get(reply.parent_id) ?? []
    list.push(reply)
    repliesByParent.set(reply.parent_id, list)
  }

  return (
    <section id="comments" className="mt-16 border-t border-[var(--line)] pt-10">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
          留言區
        </p>
        <span className="text-xs text-[var(--muted-ink)]">{comments.length} 則</span>
      </div>

      {viewer.userId ? (
        <CommentComposer postId={postId} />
      ) : (
        <p className="mt-6 rounded-2xl bg-[var(--sand)] px-4 py-3 text-sm text-[var(--muted-ink)]">
          想留言？{" "}
          <Link href="/login" className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline">
            先登入
          </Link>
          {" 或 "}
          <Link href="/register" className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline">
            註冊一個帳號
          </Link>
          。
        </p>
      )}

      {tops.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted-ink)]">還沒有留言，留下你的看法吧。</p>
      ) : (
        <ol className="mt-8 space-y-8">
          {tops.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              replies={repliesByParent.get(comment.id) ?? []}
              postId={postId}
              postSlug={postSlug}
              viewer={viewer}
            />
          ))}
        </ol>
      )}
    </section>
  )
}

interface CommentNodeProps {
  comment: Comment
  replies: Comment[]
  postId: string
  postSlug: string
  viewer: Viewer
}

function CommentNode({ comment, replies, postId, postSlug, viewer }: CommentNodeProps) {
  return (
    <li className="space-y-4">
      <CommentBody comment={comment} postSlug={postSlug} viewer={viewer} />

      {replies.length > 0 ? (
        <ol className="space-y-4 border-l border-[var(--line)] pl-5 sm:ml-12">
          {replies.map((reply) => (
            <li key={reply.id}>
              <CommentBody comment={reply} postSlug={postSlug} viewer={viewer} />
            </li>
          ))}
        </ol>
      ) : null}

      {viewer.userId ? (
        <details className="sm:ml-12">
          <summary className="cursor-pointer text-xs font-semibold text-[var(--brand)]">
            回覆
          </summary>
          <div className="mt-3">
            <CommentComposer postId={postId} parentId={comment.id} compact />
          </div>
        </details>
      ) : null}
    </li>
  )
}

interface CommentBodyProps {
  comment: Comment
  postSlug: string
  viewer: Viewer
}

function CommentBody({ comment, postSlug, viewer }: CommentBodyProps) {
  const author = comment.profile
  const authorName = author?.nickname ?? "已離開的成員"
  const isOwner = viewer.userId === comment.author_id
  const isAdmin = (viewer.profile?.trust_level ?? 0) >= 3

  return (
    <article className="flex gap-4">
      <Avatar className="h-10 w-10 shrink-0" name={authorName} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-[var(--muted-ink)]">
          {author ? (
            <Link
              href={`/users/${comment.author_id}`}
              className="font-semibold text-[var(--ink)] hover:text-[var(--brand)]"
            >
              {authorName}
            </Link>
          ) : (
            <span className="font-semibold text-[var(--ink)]">{authorName}</span>
          )}
          {author && author.trust_level >= 1 ? (
            <span className="font-semibold uppercase tracking-wider text-[var(--brand)]">
              已驗證
            </span>
          ) : null}
          <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
        </div>

        <div
          className="prose-whv text-sm leading-7"
          dangerouslySetInnerHTML={{ __html: sanitizeHtmlFragment(comment.content) }}
        />

        <div className="flex items-center gap-4 text-xs">
          {viewer.userId && !isOwner ? (
            <ReportButton
              targetType="comment"
              targetId={comment.id}
              returnTo={`/posts/${postSlug}#comments`}
            />
          ) : null}
          {isOwner || isAdmin ? (
            <form action={deleteCommentAction}>
              <input type="hidden" name="commentId" value={comment.id} />
              <input type="hidden" name="slug" value={postSlug} />
              <button
                type="submit"
                className="cursor-pointer text-[var(--muted-ink)] hover:text-red-600"
              >
                刪除
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  )
}

interface CommentComposerProps {
  postId: string
  parentId?: string
  compact?: boolean
}

function CommentComposer({ postId, parentId, compact }: CommentComposerProps) {
  return (
    <form
      action={createCommentAction}
      className={compact ? "space-y-2" : "mt-6 space-y-3"}
    >
      <input type="hidden" name="postId" value={postId} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <textarea
        name="content"
        required
        minLength={2}
        maxLength={2000}
        rows={compact ? 2 : 3}
        placeholder={parentId ? "回覆這則留言⋯" : "分享你的看法（自動換行）"}
        className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-ink)]/70 focus:border-[var(--brand)]"
      />
      <div className="flex items-center gap-3">
        <SubmitButton className="!px-4 !py-2 !text-sm" pendingLabel="送出中…">
          {parentId ? "送出回覆" : "送出留言"}
        </SubmitButton>
        {!compact ? (
          <span className="text-[11px] text-[var(--muted-ink)]">
            送出代表你願意以實名身份留言。重複留言或廣告會被隱藏。
          </span>
        ) : null}
      </div>
    </form>
  )
}
