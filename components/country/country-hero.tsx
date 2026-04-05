import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Country } from "@/types"

export function CountryHero({ country }: { country: Country }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="overflow-hidden">
        <CardContent className="space-y-5 p-8">
          <Badge>國家知識庫</Badge>
          <div className="space-y-3">
            <p className="text-4xl">{country.flag_emoji}</p>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">
              {country.name_zh}
              <span className="ml-3 text-lg font-medium text-[var(--muted-ink)]">{country.name_en}</span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--muted-ink)]">{country.visa_info.overview}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Info label="年齡條件" value={country.visa_info.ageRange} />
            <Info label="停留期間" value={country.visa_info.stayDuration} />
            <Info label="申請時程" value={country.visa_info.processingTime} />
            <Info label="預算建議" value={country.visa_info.estimatedBudget} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="grid gap-4 p-8">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">申請步驟</p>
            <ol className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted-ink)]">
              {country.visa_info.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sand)] text-xs font-semibold text-[var(--brand)]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">行前清單</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-ink)]">
              {country.visa_info.checklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--sand)]/65 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-ink)]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[var(--ink)]">{value}</p>
    </div>
  )
}
