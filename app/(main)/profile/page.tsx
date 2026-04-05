import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { getProfiles } from "@/lib/data"

export const metadata = { title: "過來人" }

export default async function ProfilePage() {
  const profiles = await getProfiles()

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand)]">過來人</p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">他們走過的路，也許就是你正在找的方向。</h1>
        <p className="max-w-3xl text-base leading-8 text-[var(--muted-ink)]">
          棲地無界收集過來人的經驗卡片，讓下一位出發者能快速判斷誰最能幫到自己。
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className="transition hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12" name={profile.nickname} />
                <div>
                  <p className="text-lg font-bold text-[var(--ink)]">{profile.nickname}</p>
                  {profile.is_verified ? (
                    <span className="text-xs font-semibold text-[var(--brand)]">已驗證</span>
                  ) : null}
                </div>
              </div>
              <p className="text-sm leading-7 text-[var(--muted-ink)]">{profile.bio}</p>
              {profile.can_help ? (
                <div className="rounded-2xl bg-[var(--sand)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted-ink)]">能幫什麼</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink)]">{profile.can_help}</p>
                </div>
              ) : null}
              {profile.countries_visited.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.countries_visited.map((slug) => (
                    <span key={slug} className="rounded-full bg-[var(--sky-light)] px-3 py-1 text-xs font-medium text-[var(--ink)]">
                      {slug}
                    </span>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="grid gap-5 lg:grid-cols-3">
        <ProfileHint
          title="內容由團隊上架"
          description="過來人卡片目前由棲地無界團隊整理與上架，確保內容品質。"
        />
        <ProfileHint
          title="想成為過來人？"
          description="如果你也有打工度假經驗想分享，歡迎透過棲地無界的聯繫管道與我們聯絡。"
        />
        <ProfileHint
          title="持續更新中"
          description="我們會持續收集更多過來人的經驗，讓這張網絡越來越完整。"
        />
      </section>
    </div>
  )
}

function ProfileHint({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card className="bg-[var(--card)]">
      <CardContent className="space-y-2 p-5">
        <h2 className="font-bold text-[var(--ink)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-ink)]">{description}</p>
      </CardContent>
    </Card>
  )
}
