"use client"

import { useLinkStatus } from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface LinkPendingOverlayProps {
  className?: string
  spinnerClassName?: string
}

// Render this as a child of a <Link> to flash a spinner overlay while the
// route transition is in flight. Reads pending state via useLinkStatus().
export function LinkPendingOverlay({ className, spinnerClassName }: LinkPendingOverlayProps) {
  const { pending } = useLinkStatus()
  if (!pending) return null

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-white/65 backdrop-blur-[1px]",
        className,
      )}
    >
      <Spinner className={cn("h-5 w-5", spinnerClassName)} />
    </div>
  )
}
