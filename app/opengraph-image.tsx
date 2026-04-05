import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "radial-gradient(circle at 58% 25%, rgba(192,154,118,0.25), transparent 35%), linear-gradient(180deg, #121117 0%, #0b0a0d 100%)",
          color: "#f3ece3",
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 8, textTransform: "uppercase", opacity: 0.72 }}>
          Samuel Adepoju
        </div>
        <div style={{ maxWidth: 760, fontSize: 78, lineHeight: 1.02, letterSpacing: -4 }}>
          Designing clarity in complex systems
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.4, maxWidth: 860, opacity: 0.82 }}>
          A premium editorial portfolio shaped around product thinking, systems, and calm digital experiences.
        </div>
      </div>
    ),
    size,
  );
}
