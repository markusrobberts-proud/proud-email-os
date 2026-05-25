import { ImageResponse } from "next/og"

// Favicon: bold white "P" on a deep-black squircle with a single
// blue accent dot, echoing the impact / punctuation in PUNCH.
export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1D1D1F 100%)",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            transform: "translateY(-1px)",
          }}
        >
          P
        </span>
        <div
          style={{
            position: "absolute",
            right: 4,
            bottom: 4,
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "#007AFF",
          }}
        />
      </div>
    ),
    { ...size },
  )
}
