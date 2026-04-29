import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-5 w-5 animate-spin text-[var(--brand)]", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.2"
        fill="none"
      />
      <path
        d="M21 12a9 9 0 0 1-9 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

interface LoadingStateProps {
  label?: string
  className?: string
}

export function LoadingState({
  label = "正在整理內容…",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center",
        className,
      )}
    >
      <Spinner className="h-9 w-9" />
      <p className="text-sm text-[var(--muted-ink)]">{label}</p>
      <span className="sr-only">Loading</span>
    </div>
  )
}
