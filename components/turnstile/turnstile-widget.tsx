"use client"

import { useEffect, useRef } from "react"

interface TurnstileWidgetProps {
  siteKey: string
  inputName?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          "error-callback"?: () => void
          "expired-callback"?: () => void
          theme?: "light" | "dark" | "auto"
        },
      ) => string
      reset: (id?: string) => void
      remove: (id: string) => void
    }
  }
}

const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

export function TurnstileWidget({ siteKey, inputName = "cfTurnstileResponse" }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!siteKey) return

    let cancelled = false

    function mount() {
      if (cancelled || !containerRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => {
          if (inputRef.current) inputRef.current.value = token
        },
        "expired-callback": () => {
          if (inputRef.current) inputRef.current.value = ""
        },
        "error-callback": () => {
          if (inputRef.current) inputRef.current.value = ""
        },
        theme: "light",
      })
    }

    if (window.turnstile) {
      mount()
      return () => {
        cancelled = true
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current)
        }
      }
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]")
    if (existing) {
      existing.addEventListener("load", mount, { once: true })
    } else {
      const script = document.createElement("script")
      script.src = TURNSTILE_SCRIPT_URL
      script.async = true
      script.defer = true
      script.dataset.turnstile = "1"
      script.addEventListener("load", mount, { once: true })
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [siteKey])

  if (!siteKey) return null

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="hidden" name={inputName} />
      <div ref={containerRef} className="cf-turnstile" />
    </div>
  )
}
