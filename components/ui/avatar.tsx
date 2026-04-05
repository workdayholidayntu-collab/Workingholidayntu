import type { HTMLAttributes } from "react"
import { initials, cn } from "@/lib/utils"

export function Avatar({
  className,
  name,
}: HTMLAttributes<HTMLDivElement> & { name?: string | null }) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--sky-light),var(--sky-deep))] text-sm font-semibold text-white",
        className,
      )}
    >
      {initials(name)}
    </div>
  )
}
