"use client"

import { useLinkStatus } from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

// Inline spinner variant of LinkPendingOverlay — for text-only links
// (nav tabs, header chrome) where a backdrop overlay would look heavy.
// Renders nothing when not pending; otherwise emits a small spinner that
// the parent <Link> can lay out alongside its label.

interface LinkPendingInlineProps {
  className?: string
}

export function LinkPendingInline({ className }: LinkPendingInlineProps) {
  const { pending } = useLinkStatus()
  if (!pending) return null
  return <Spinner className={cn("h-3 w-3", className)} />
}
