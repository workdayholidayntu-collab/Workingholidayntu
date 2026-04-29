import type { Metadata } from "next"
import Link from "next/link"
import { Avatar } from "@/components/ui/avatar"
import { LinkPendingInline } from "@/components/ui/link-pending-inline"
import { LinkPendingOverlay } from "@/components/ui/link-pending-overlay"
import { CommentThread } from "@/components/comment/comment-thread"
import { ReportButton } from "@/components/report/report-button"
import {
  getApprovedPosts,
  getCountries,
  getCurrentViewer,
  getPostBodyHtml,
  getPostComments,
  getProfiles,
  requirePost,
} from "@/lib/data"
import { buildUrl, formatDate } from "@/lib/utils"
import type { Country, Post, Profile } from "@/types"

interface PostPageParams {
  slug: string
}

interface PostPageProps {
  params: Promise<PostPageParams>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await requirePost(slug)
  const url = buildUrl(`/posts/${post.slug}`)
  const description = post.excerpt ?? "棲地無界文章"

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      locale: "zh_TW",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  }
}

function getAuthorName(post: Post, author?: Profile): string {
  if (author?.nickname) return author.nickname
  if (post.author_display_name) return post.author_display_name
  return "棲地無界"
}

function buildArticleJsonLd(post: Post, authorName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    inLanguage: "zh-Hant",
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: "棲地無界 Borderless Habitat",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": buildUrl(`/posts/${post.slug}`),
    },
    keywords: post.tags.join(", "),
  }
}

interface RelatedPostsProps {
  posts: Post[]
  countries: Country[]
}

function RelatedPosts({ posts, countries }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="mt-16 border-t border-[var(--line)] pt-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-ink)]">
        繼續閱讀
      </p>
      <div className="mt-4 grid gap-3">
        {posts.map((p) => {
          const country = countries.find((c) => c.slug === p.country_slug)
          return (
            <Link
              key={p.id}
              href={`/posts/${p.slug}`}
              className="group relative flex items-baseline gap-4 border-b border-[var(--line)] py-4 transition last:border-b-0"
            >
              <LinkPendingOverlay className="!rounded-none" />
              {country ? (
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-[var(--muted-ink)]">
                  {country.flag_emoji} {country.name_zh}
                </span>
              ) : null}
              <span className="heading-editorial flex-1 text-base text-[var(--ink)] group-hover:text-[var(--brand)] sm:text-lg">
                {p.title}
              </span>
              <time className="hidden shrink-0 text-xs text-[var(--muted-ink)] sm:block">
                {formatDate(p.created_at)}
              </time>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

interface AuthorCardProps {
  authorName: string
  author?: Profile
}

function AuthorCard({ authorName, author }: AuthorCardProps) {
  return (
    <aside className="mt-12 rounded-3xl bg-[var(--sand)] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14" name={authorName} />
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <p className="heading-editorial text-lg text-[var(--ink)]">{authorName}</p>
            {author?.trust_level && author.trust_level >= 1 ? (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--brand)]">
                已驗證
              </span>
            ) : null}
          </div>
          {author?.bio ? (
            <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">{author.bio}</p>
          ) : null}
          {author?.can_help ? (
            <p className="mt-3 text-sm leading-6 text-[var(--ink)]">
              <span className="font-semibold">可以幫忙：</span>
              {author.can_help}
            </p>
          ) : null}
          {author ? (
            <Link
              href={`/users/${author.id}`}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] underline-offset-4 hover:underline"
            >
              <LinkPendingInline />
              查看 {authorName} 的所有故事 →
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await requirePost(slug)
  const [countries, profiles, comments, viewer] = await Promise.all([
    getCountries(),
    getProfiles(),
    getPostComments(post.id),
    getCurrentViewer(),
  ])

  const country = countries.find((item) => item.slug === post.country_slug)
  const author = profiles.find((item) => item.id === post.author_id)
  const authorName = getAuthorName(post, author)
  const jsonLd = buildArticleJsonLd(post, authorName)
  const isOwner = viewer.userId === post.author_id

  const relatedPosts = post.country_slug
    ? (await getApprovedPosts(post.country_slug)).filter((p) => p.id !== post.id).slice(0, 4)
    : []

  return (
    <article className="mx-auto max-w-[680px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-5 pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          <span>過來人訪談</span>
          {country ? (
            <span className="text-[var(--muted-ink)]">
              · {country.flag_emoji} {country.name_zh}
            </span>
          ) : null}
        </div>

        <h1 className="heading-editorial text-[clamp(2rem,4.5vw,3.25rem)] text-[var(--ink)]">
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="text-lg leading-8 text-[var(--muted-ink)]">{post.excerpt}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-5 text-sm">
          <Avatar className="h-9 w-9" name={authorName} />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-[var(--ink)]">{authorName}</span>
            <time
              dateTime={post.created_at}
              className="text-xs text-[var(--muted-ink)]"
            >
              {formatDate(post.created_at)}
            </time>
          </div>
          {post.tags.length > 0 ? (
            <div className="ml-auto flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  href={`/search?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-[var(--sand)] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted-ink)] transition hover:bg-[var(--brand)]/10 hover:text-[var(--brand)]"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <div
        className="prose-whv text-[17px]"
        dangerouslySetInnerHTML={{ __html: getPostBodyHtml(post) }}
      />

      {viewer.userId && !isOwner ? (
        <div className="mt-8 flex items-center gap-3 text-xs text-[var(--muted-ink)]">
          <span>覺得這篇有問題？</span>
          <ReportButton
            targetType="post"
            targetId={post.id}
            returnTo={`/posts/${post.slug}`}
          />
        </div>
      ) : null}

      <AuthorCard authorName={authorName} author={author} />

      <CommentThread
        postId={post.id}
        postSlug={post.slug}
        comments={comments}
        viewer={viewer}
      />

      <RelatedPosts posts={relatedPosts} countries={countries} />
    </article>
  )
}
