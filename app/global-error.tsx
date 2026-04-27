"use client"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="zh-Hant">
      <body
        style={{
          fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
          background: "#f4f8fb",
          color: "#1c2733",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 520, textAlign: "left" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#3b82f6",
            }}
          >
            500 · Borderless Habitat
          </p>
          <h1 style={{ fontSize: "2.4rem", lineHeight: 1.1, margin: "0.75rem 0 1rem", fontWeight: 600 }}>
            棲地暫時離線。
          </h1>
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#5f6c7a", margin: 0 }}>
            連根節點都倒了 —— 我們已經接到通知，正在搶修。請稍等幾秒再試一次。
          </p>
          {error.digest ? (
            <p style={{ marginTop: "1rem", fontSize: "11px", fontFamily: "ui-monospace, monospace", color: "#5f6c7a" }}>
              錯誤代碼：{error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: 999,
              background: "#1c2733",
              color: "white",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            重新載入
          </button>
        </div>
      </body>
    </html>
  )
}
