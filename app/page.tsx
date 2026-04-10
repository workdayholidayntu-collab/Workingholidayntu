import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BookOpenText,
  Globe,
  MessageCircleMore,
  UsersRound,
} from "lucide-react"
import { CountryNav } from "@/components/country/country-nav"
import { PostCard } from "@/components/post/post-card"
import { Button } from "@/components/ui/button"
import { getApprovedPosts, getCountries, getProfiles } from "@/lib/data"

export default async function HomePage() {
  const [countries, posts, profiles] = await Promise.all([getCountries(), getApprovedPosts(), getProfiles()])

  return (
    <main className="flex min-h-screen flex-col">
      {/* ── Full-width hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--sky-light)] via-[var(--sky-mid)] to-[var(--sky-deep)]">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/logo.png" alt="棲地無界" width={44} height={44} className="drop-shadow-lg" />
            <span className="text-lg font-semibold text-white/90 tracking-wide">棲地無界 WHV</span>
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
            打工度假資訊、經驗分享與互助入口，先從你要去的國家開始。
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            我們把散落在 Facebook 社團、PTT 和私人筆記裡的打工度假資訊，整理成結構化的知識庫。從國家簽證、落地預算到過來人的真實經驗，讓你出發前就有方向。
          </p>

          {/* Horizontal metrics strip */}
          <div className="mt-10 flex flex-wrap gap-8 text-white/90">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-white/60" />
              <span className="text-3xl font-bold">18</span>
              <span className="text-sm text-white/70">國知識庫</span>
            </div>
            <div className="h-10 w-px bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-3">
              <MessageCircleMore className="h-5 w-5 text-white/60" />
              <span className="text-3xl font-bold">Realtime</span>
              <span className="text-sm text-white/70">即時討論</span>
            </div>
            <div className="h-10 w-px bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-3">
              <UsersRound className="h-5 w-5 text-white/60" />
              <span className="text-3xl font-bold">{posts.length}+</span>
              <span className="text-sm text-white/70">篇過來人經驗</span>
            </div>
          </div>

          {/* Single prominent CTA */}
          <div className="mt-12">
            <Link href="/countries">
              <Button className="h-14 gap-3 rounded-2xl bg-[var(--ink)] px-8 text-base font-semibold text-white shadow-lg shadow-black/20 hover:bg-[var(--ink)]/90 hover:text-white">
                進入網站
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Content sections ── */}
      <div className="mx-auto w-full max-w-7xl flex flex-col gap-14 px-4 py-12 sm:px-6 lg:px-8">
        {/* Country flags */}
        <section className="space-y-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand)]">Country Index</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-[var(--ink)]">從國旗開始，直接進入國家頁</h2>
            </div>
            <Link href="/countries" className="text-sm font-semibold text-[var(--brand)] hover:underline">
              查看全部國家
            </Link>
          </div>
          <CountryNav countries={countries} />
        </section>

        {/* Latest stories */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand)]">Latest Stories</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[var(--ink)]">過來人的實戰筆記</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                country={countries.find((country) => country.slug === post.country_slug)}
                author={profiles.find((profile) => profile.id === post.author_id)}
              />
            ))}
          </div>
        </section>

        {/* Bottom feature cards */}
        <section className="grid gap-5 lg:grid-cols-3">
          <FeatureCard
            icon={BookOpenText}
            title="找資訊"
            subtitle="國家入口"
            description="先進國家頁，再看簽證、住宿、找工與文章脈絡。"
          />
          <FeatureCard
            icon={UsersRound}
            title="找人脈"
            subtitle="過來人網絡"
            description="找到去過同一個國家的學長姐，直接請教最在地的經驗與建議。"
          />
          <FeatureCard
            icon={MessageCircleMore}
            title="找互動"
            subtitle="文章討論"
            description="每篇文章下方都能留言補充，讓經驗持續被下一位出發者完善。"
          />
        </section>
      </div>
    </main>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--card)] p-7 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 inline-flex rounded-2xl bg-[var(--sand)] p-3">
        <Icon className="h-5 w-5 text-[var(--brand)]" />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted-ink)]">{title}</p>
      <p className="mt-1 text-2xl font-bold text-[var(--ink)]">{subtitle}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">{description}</p>
    </div>
  )
}
