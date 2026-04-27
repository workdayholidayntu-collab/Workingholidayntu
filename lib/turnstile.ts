export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
}

interface TurnstileVerifyResponse {
  success: boolean
  "error-codes"?: string[]
}

export async function verifyTurnstileToken(token: unknown): Promise<{ success: boolean; reason?: string }> {
  if (!isTurnstileConfigured()) return { success: true }

  if (typeof token !== "string" || token.length === 0) {
    return { success: false, reason: "缺少人機驗證 token，請重新提交" }
  }

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY ?? "",
    response: token,
  })

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      cache: "no-store",
    })
    const data = (await res.json()) as TurnstileVerifyResponse
    if (data.success) return { success: true }
    return {
      success: false,
      reason: `人機驗證失敗（${data["error-codes"]?.join(",") ?? "unknown"}）`,
    }
  } catch {
    return { success: false, reason: "無法連線至人機驗證服務" }
  }
}
