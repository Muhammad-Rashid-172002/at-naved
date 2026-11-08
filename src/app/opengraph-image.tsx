import { ImageResponse } from "next/og";

export const alt = "AT Naveed Fast Food, Pabbi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FFC21A", padding: 72, color: "#3B1611" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", width: 96, height: 96, alignItems: "center", justifyContent: "center", border: "6px solid #3B1611", borderRadius: 24, background: "#fff", fontSize: 44, fontWeight: 900, transform: "rotate(-6deg)" }}>AT</div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>Pabbi, Khyber Pakhtunkhwa</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 900, lineHeight: 0.9, letterSpacing: -6 }}>AT Naveed</div>
          <div style={{ fontSize: 150, fontWeight: 900, lineHeight: 0.9, letterSpacing: -6 }}>Fast Food</div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 34, fontWeight: 700 }}>
          <span style={{ background: "#E0301E", color: "#fff", padding: "10px 24px", borderRadius: 999 }}>Order online</span>
          <span style={{ padding: "10px 0" }}>Burgers, pizza, shawarma and fried chicken</span>
        </div>
      </div>
    ),
    size,
  );
}
