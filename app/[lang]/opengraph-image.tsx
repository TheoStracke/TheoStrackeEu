import { ImageResponse } from "next/og";
import { TS_LOGO } from "@/lib/brand";
import { getDictionary } from "@/lib/getDictionary";
import { i18n, isValidLocale } from "@/lib/i18n";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Theo Stracke";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isValidLocale(lang) ? lang : i18n.defaultLocale;
  const { metadata } = await getDictionary(locale);
  const [t, s, dot] = TS_LOGO.paths;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: "#080808",
        backgroundImage: "radial-gradient(circle at 82% 30%, rgba(255,49,49,0.16), transparent 45%)",
        color: "#e6e6e6",
      }}
    >
      <svg width="154" height="91" viewBox={`0 0 ${TS_LOGO.viewBox.width} ${TS_LOGO.viewBox.height}`}>
        <path d={t} fill="#e6e6e6" />
        <path d={s} fill="#e6e6e6" />
        <path d={dot} fill="#ff3131" />
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#ff3131" }}>
          {metadata.ogTagline}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 132,
            fontWeight: 700,
            letterSpacing: -6,
            lineHeight: 0.9,
            color: "#ffffff",
          }}
        >
          THEO STRACKE.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          paddingTop: 28,
          fontSize: 24,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "#8c8c8c",
        }}
      >
        <span>{metadata.jobTitle}</span>
        <span>theostracke.work</span>
      </div>
    </div>,
    size,
  );
}
