"use client"

import type { ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

// Drop-in replacement for `<Button type="submit">` inside any <form action={...}>.
// Reads pending state from the surrounding form via React 19's useFormStatus()
// and shows a spinner + disables the control while the server action is in
// flight, so users get immediate feedback that the click was received.

interface SubmitButtonProps {
  children: ReactNode
  className?: string
  variant?: "default" | "secondary" | "ghost" | "outline"
  pendingLabel?: ReactNode
}

export function SubmitButton({
  children,
  className,
  variant = "default",
  pendingLabel,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      aria-busy={pending}
      className={cn("gap-2", className)}
    >
      {pending ? <Spinner className="h-4 w-4 text-current" /> : null}
      <span>{pending ? pendingLabel ?? children : children}</span>
    </Button>
  )
}
