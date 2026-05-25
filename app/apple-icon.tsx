import { ImageResponse } from "next/og"

// Apple touch icon: same mark, scaled to 180px with a touch more
// breathing room so it sits cleanly on a home screen.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1D1D1F 100%)",
          borderRadius: 40,
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
            fontSize: 132,
            fontWeight: 900,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            transform: "translateY(-4px)",
          }}
        >
          P
        </span>
        <div
          style={{
            position: "absolute",
            right: 26,
            bottom: 26,
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#007AFF",
          }}
        />
      </div>
    ),
    { ...size },
  )
}
