import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LinkPendingOverlay } from "@/components/ui/link-pending-overlay"
import { formatDate } from "@/lib/utils"
import type { Country, Post, Profile } from "@/types"

interface PostCardProps {
  post: Post
  country?: Country | null
  author?: Profile | null
}

function getAuthorLabel(post: Post, author?: Profile | null): string {
  if (author?.nickname) return author.nickname
  if (post.author_display_name) return post.author_display_name
  return "棲地無界"
}

export function PostCard({ post, country, author }: PostCardProps) {
  const avatarSrc = author?.avatar_url || "/avatar-default.svg"
  const authorLabel = getAuthorLabel(post, author)

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative flex gap-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md sm:gap-6 sm:p-6"
    >
      <LinkPendingOverlay />
      <div className="shrink-0 text-center">
        <Image
          src={avatarSrc}
          alt={authorLabel}
          width={72}
          height={72}
          className="rounded-full object-cover"
          style={{ width: 72, height: 72 }}
        />
        <p className="mt-2 text-sm font-bold text-[var(--ink)]">{authorLabel}</p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-ink)]">
          {country ? (
            <Badge className="pointer-events-none">
              {country.flag_emoji} {country.name_zh}
            </Badge>
          ) : null}
          {post.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} className="pointer-events-none bg-white">
              {tag}
            </Badge>
          ))}
          <span className="ml-auto text-xs">{formatDate(post.created_at)}</span>
        </div>

        <h2 className="heading-editorial mt-3 text-lg text-[var(--ink)] group-hover:text-[var(--brand)] sm:text-xl">
          <span>{post.title}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="ml-1.5 inline-block h-4 w-4 opacity-0 transition group-hover:opacity-100"
          />
        </h2>

        {post.excerpt ? (
          <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--muted-ink)]">
            {post.excerpt}
          </p>
        ) : null}

        {author?.bio ? (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-ink)]">{author.bio}</p>
        ) : null}
      </div>
    </Link>
  )
}

export function PostCardFeatured({ post, country, author }: PostCardProps) {
  const authorLabel = getAuthorLabel(post, author)

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative block overflow-hidden rounded-3xl bg-[var(--sand)] p-6 transition hover:shadow-lg sm:p-10"
    >
      <LinkPendingOverlay />
      <div className="grid gap-6 sm:grid-cols-[1.4fr_1fr] sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            <span>專題</span>
            {country ? (
              <span className="text-[var(--muted-ink)]">
                · {country.flag_emoji} {country.name_zh}
              </span>
            ) : null}
          </div>

          <h2 className="heading-editorial mt-4 text-3xl text-[var(--ink)] sm:text-[2.5rem]">
            {post.title}
            <ArrowUpRight
              aria-hidden="true"
              className="ml-1.5 inline-block h-7 w-7 opacity-0 transition group-hover:opacity-100"
            />
          </h2>

          {post.excerpt ? (
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted-ink)]">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--muted-ink)]">
            <span className="font-semibold text-[var(--ink)]">{authorLabel}</span>
            <span>·</span>
            <time>{formatDate(post.created_at)}</time>
            {post.tags.length > 0 ? (
              <span className="font-medium text-[var(--brand)]">
                #{post.tags.slice(0, 3).join("　#")}
              </span>
            ) : null}
          </div>
        </div>

        {country ? (
          <div className="hidden items-end justify-end sm:flex">
            <span
              className="font-editorial text-7xl leading-none text-[var(--ink)]/15"
              aria-hidden="true"
            >
              {country.name_en}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  )
}

export function PostListItem({ post, country }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative flex items-baseline gap-4 border-b border-[var(--line)] py-4 transition last:border-b-0 hover:bg-white/40"
    >
      <LinkPendingOverlay className="!rounded-none" />
      {country ? (
        <span
          className="shrink-0 text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]"
          aria-hidden="true"
        >
          {country.flag_emoji} {country.name_zh}
        </span>
      ) : null}
      <h3 className="heading-editorial flex-1 text-base text-[var(--ink)] group-hover:text-[var(--brand)] sm:text-lg">
        {post.title}
      </h3>
      <time className="hidden shrink-0 text-xs text-[var(--muted-ink)] sm:block">
        {formatDate(post.created_at)}
      </time>
    </Link>
  )
}
