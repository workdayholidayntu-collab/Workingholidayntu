import { MarkdownEditor } from "@/components/post/markdown-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getCountries } from "@/lib/data"

export const metadata = { title: "文章上架" }

export default async function NewPostPage() {
  const countries = await getCountries()

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand)]">內容管理</p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">文章上架</h1>
        <p className="max-w-3xl text-base leading-8 text-[var(--muted-ink)]">
          所有內容由棲地無界團隊整理後統一上架，確保資訊品質與一致性。
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>文章欄位</CardTitle>
          <CardDescription>
            填寫以下欄位後由團隊審核上架。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
              目的地
              <select
                name="countrySlug"
                className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 text-sm text-[var(--ink)] outline-none"
                defaultValue={countries[0]?.slug}
                disabled
              >
                {countries.map((country) => (
                  <option key={country.slug} value={country.slug}>
                    {country.flag_emoji} {country.name_zh}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
              標籤
              <Input name="tags" placeholder="例如：澳洲, 求職, 農場" disabled />
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            標題
            <Input name="title" placeholder="例如：澳洲第一份農場工作怎麼拿到" disabled />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
            摘要
            <Textarea name="excerpt" placeholder="用 2-3 句話說明這篇能幫讀者解決什麼問題。" disabled />
          </label>
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--ink)]">內容編輯器</p>
            <MarkdownEditor />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
