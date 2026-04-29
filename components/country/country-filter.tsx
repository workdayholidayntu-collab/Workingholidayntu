"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { Country } from "@/types"

interface CountryFilterProps {
  countries: Country[]
  activeSlug?: string
}

export function CountryFilter({ countries, activeSlug }: CountryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)

  function handleSelect(slug?: string) {
    setPendingSlug(slug ?? "__all__")
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set("country", slug)
    } else {
      params.delete("country")
    }
    const qs = params.toString()
    const target = qs ? `/?${qs}` : "/"
    startTransition(() => router.push(target))
  }

  const inFlight = pending ? pendingSlug : null

  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip
        active={!activeSlug}
        pending={inFlight === "__all__"}
        disabled={pending}
        onClick={() => handleSelect(undefined)}
      >
        全部
      </FilterChip>
      {countries.map((country) => (
        <FilterChip
          key={country.slug}
          active={activeSlug === country.slug}
          pending={inFlight === country.slug}
          disabled={pending}
          onClick={() => handleSelect(country.slug)}
        >
          {country.flag_emoji} {country.name_zh}
        </FilterChip>
      ))}
    </div>
  )
}

interface FilterChipProps {
  active: boolean
  pending: boolean
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}

function FilterChip({ active, pending, disabled, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={pending}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
          : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--brand)]/40",
        disabled && !pending && "opacity-60",
        pending && "cursor-progress",
      )}
    >
      {pending ? <Spinner className="h-3.5 w-3.5 text-current" /> : null}
      {children}
    </button>
  )
}
