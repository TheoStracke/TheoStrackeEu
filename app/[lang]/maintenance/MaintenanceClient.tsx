"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import "./maintenance.css";

interface Props {
  lang: Locale;
  content: { title: string; desc: string; note: string };
}

// ── Canvas: dot-grid + scanline ─────────────────────────────────────────────
function GridCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number, t = 0;
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize();
    addEventListener("resize", resize);
    const tick = () => {
      t += 0.004;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sp = 44;
      for (let x = 0; x < canvas.width; x += sp) {
        for (let y = 0; y < canvas.height; y += sp) {
          const d = Math.hypot(x - canvas.width / 2, y - canvas.height / 2);
          const p = 0.5 + 0.5 * Math.sin(t * 2 - d * 0.011);
          ctx.globalAlpha = p * 0.12;
          ctx.fillStyle = "#C8FF00";
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      const sy = ((t * 85) % (canvas.height + 60)) - 30;
      const g = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
      g.addColorStop(0, "rgba(200,255,0,0)");
      g.addColorStop(0.5, "rgba(200,255,0,0.05)");
      g.addColorStop(1, "rgba(200,255,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, sy - 40, canvas.width, 80);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      aria-hidden
    />
  );
}

// ── Typewriter ───────────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 44) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      setOut(text.slice(0, ++i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

// ── TS Logo (simplificado) ───────────────────────────────────────────────────
function TsLogo({ hovered }: { hovered: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 375 375"
      width="92"
      height="92"
      style={{
        display: "block",
        transition: "filter 0.35s ease, transform 0.35s ease",
        filter: hovered
          ? "drop-shadow(0 0 18px rgba(200,255,0,0.5)) drop-shadow(0 0 5px rgba(200,255,0,0.3))"
          : "none",
        transform: hovered ? "scale(1.08) rotate(-2deg)" : "scale(1) rotate(0deg)",
      }}
    >
      <g fill="#ffffff" fillOpacity="1">
        <g transform="translate(23.713276, 263.255995)">
          <path d="M 8.984375 -141.28125 L 46.234375 -141.28125 L 46.234375 -184.953125 L 84.765625 -184.953125 L 84.765625 -141.28125 L 137.421875 -141.28125 L 137.421875 -106.609375 L 84.765625 -106.609375 L 84.765625 -48.8125 C 84.765625 -44.351562 86.003906 -40.878906 88.484375 -38.390625 C 90.972656 -35.910156 94.441406 -34.671875 98.890625 -34.671875 L 134.859375 -34.671875 L 134.859375 0 L 95.046875 0 C 79.804688 0 67.859375 -4.320312 59.203125 -12.96875 C 50.554688 -21.613281 46.234375 -33.5625 46.234375 -48.8125 L 46.234375 -106.609375 L 8.984375 -106.609375 Z" />
        </g>
      </g>
      <g fill="#ffffff" fillOpacity="1">
        <g transform="translate(150.612488, 263.255995)">
          <path d="M 70.390625 2.5625 C 52.742188 2.5625 38.953125 -0.816406 29.015625 -7.578125 C 19.085938 -14.335938 13.269531 -24.226562 11.5625 -37.25 L 50.09375 -37.25 C 51.289062 -33.3125 53.644531 -30.3125 57.15625 -28.25 C 60.664062 -26.195312 65.078125 -25.171875 70.390625 -25.171875 L 83.234375 -25.171875 C 90.421875 -25.171875 95.894531 -26.453125 99.65625 -29.015625 C 103.425781 -31.585938 105.3125 -35.273438 105.3125 -40.078125 C 105.3125 -48.460938 98.460938 -53.425781 84.765625 -54.96875 L 65.5 -57.03125 C 47.863281 -58.914062 34.890625 -63.410156 26.578125 -70.515625 C 18.273438 -77.617188 14.125 -87.765625 14.125 -100.953125 C 14.125 -114.828125 18.960938 -125.441406 28.640625 -132.796875 C 38.316406 -140.160156 52.234375 -143.84375 70.390625 -143.84375 L 83.234375 -143.84375 C 100.359375 -143.84375 113.753906 -140.585938 123.421875 -134.078125 C 133.097656 -127.578125 138.707031 -117.90625 140.25 -105.0625 L 101.71875 -105.0625 C 99.832031 -112.59375 93.671875 -116.359375 83.234375 -116.359375 L 70.390625 -116.359375 C 57.710938 -116.359375 51.375 -112.078125 51.375 -103.515625 C 51.375 -95.296875 57.195312 -90.503906 68.84375 -89.140625 L 89.390625 -86.828125 C 124.835938 -82.710938 142.5625 -67.640625 142.5625 -41.609375 C 142.5625 -27.054688 137.507812 -16.054688 127.40625 -8.609375 C 117.300781 -1.160156 102.578125 2.5625 83.234375 2.5625 Z" />
        </g>
      </g>
      <g transform="matrix(1, 0, 0, 1, 241, 60)">
        <g fill="#ff3131" fillOpacity="1">
          <g transform="translate(1.159007, 201.295224)">
            <path
              d="M 77.140625 -37.6875 C 83.160156 -37.6875 87.488281 -37.078125 90.125 -35.859375 C 92.769531 -34.648438 94.09375 -32.617188 94.09375 -29.765625 L 94.09375 -6.65625 C 94.09375 -3.8125 92.769531 -1.78125 90.125 -0.5625 C 87.488281 0.644531 83.160156 1.25 77.140625 1.25 C 71.109375 1.25 66.769531 0.644531 64.125 -0.5625 C 61.488281 -1.78125 60.171875 -3.8125 60.171875 -6.65625 L 60.171875 -29.765625 C 60.171875 -32.617188 61.488281 -34.648438 64.125 -35.859375 C 66.769531 -37.078125 71.109375 -37.6875 77.140625 -37.6875 Z"
              style={{
                transition: "filter 0.3s ease",
                filter: hovered ? "drop-shadow(0 0 10px rgba(255,49,49,0.9))" : "none",
              }}
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

// ── Main Client Component ────────────────────────────────────────────────────
export function MaintenanceClient({ lang, content }: Props) {
  const typed = useTypewriter(content.title);
  const [logoHovered, setLogoHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const langs = [
    { code: "pt", label: "Português" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
  ];

  return (
    <>
      {mounted && <GridCanvas />}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <div
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            style={{ cursor: "default" }}
          >
            <TsLogo hovered={logoHovered} />
          </div>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            fontWeight: 500,
            margin: "0 0 1rem 0",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {mounted ? typed : content.title}
          {mounted && (
            <span
              style={{
                display: "inline-block",
                width: "0.125em",
                height: "1em",
                backgroundColor: "#C8FF00",
                marginLeft: "0.125em",
                verticalAlign: "middle",
                animation: "blink 1s step-end infinite",
              }}
            />
          )}
        </h1>

        <p
          style={{
            fontSize: "clamp(1.1rem, 4vw, 1.5rem)",
            margin: "0 0 0.75rem 0",
            opacity: 0.9,
            maxWidth: "600px",
          }}
        >
          {content.desc}
        </p>

        <p
          style={{
            fontSize: "1rem",
            margin: "0 0 2rem 0",
            opacity: 0.7,
            fontStyle: "italic",
          }}
        >
          {content.note}
        </p>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          {langs.map(l => (
            <a
              key={l.code}
              href={`/${l.code}/maintenance`}
              style={{
                color: lang === l.code ? "#C8FF00" : "#fff",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: lang === l.code ? 600 : 400,
                borderBottom: lang === l.code ? "2px solid #C8FF00" : "none",
                paddingBottom: "2px",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (lang !== l.code) e.currentTarget.style.color = "#C8FF00";
              }}
              onMouseLeave={(e) => {
                if (lang !== l.code) e.currentTarget.style.color = "#fff";
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
}