import { Badge } from "@/components/ui/badge"
import type { PlatformStatus } from "@/lib/platform-status"

export function PlatformBanner({ status }: { status: PlatformStatus }) {
  return (
    <div className="border-b border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted-ink)]">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <Badge className="bg-[var(--sand)] text-[var(--ink)]">Beta</Badge>
        <p>{status.message}</p>
      </div>
    </div>
  )
}
