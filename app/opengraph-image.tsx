import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "棲地無界 Borderless Habitat — 為台灣出發者打造的打工度假平台"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #f4f8fb 0%, #e4f0f6 50%, #BCE1DF 100%)",
          color: "#1a2a3a",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.32em",
            color: "#0086CC",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          BORDERLESS HABITAT
        </div>

        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#1a2a3a",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>真實走過的人，</span>
          <span>才寫得出能用的指南。</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 24,
            color: "#5a7a8f",
          }}
        >
          <span>棲地無界 · 台灣人海外打工度假社群</span>
          <span style={{ fontWeight: 700, color: "#1a2a3a" }}>borderlesshabitat</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
