"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { stopScroll, startScroll } from "./lenis-provider";

// ─── SVG letter paths (outlines used for stroke-draw animation) ──────────────
const T_PATH =
  "M83.25 178.25C69.25 178.25 58.25 174.25 50.25 166.25C42.25 158.25 38.25 147.25 38.25 133.25V74.5H2V40.75H38.25V2H75.75V40.75H127V74.5H75.75V133.25C75.75 140.75 79.5 144.5 87 144.5H124.5V178.25H83.25Z";

const S_PATH =
  "M188.5 178.75C177.167 178.75 167.25 177 158.75 173.5C150.25 169.833 143.583 164.833 138.75 158.5C134.083 152.167 131.75 144.75 131.75 136.25H169.25C169.25 140.25 171 143.5 174.5 146C178.167 148.333 182.833 149.5 188.5 149.5H199.5C206.333 149.5 211.5 148.25 215 145.75C218.667 143.25 220.5 139.75 220.5 135.25C220.5 131.083 218.917 127.917 215.75 125.75C212.583 123.417 207.667 121.833 201 121L185 119C167.833 116.833 155.333 112.667 147.5 106.5C139.667 100.333 135.75 90.9167 135.75 78.25C135.75 64.9167 140.333 54.5833 149.5 47.25C158.667 39.9167 172.083 36.25 189.75 36.25H199.25C216.083 36.25 229.5 39.9167 239.5 47.25C249.5 54.5833 254.5 64.4167 254.5 76.75H217C217 73.4167 215.333 70.75 212 68.75C208.833 66.5833 204.583 65.5 199.25 65.5H189.75C183.583 65.5 179.083 66.5833 176.25 68.75C173.417 70.75 172 73.8333 172 78C172 81.8333 173.25 84.75 175.75 86.75C178.417 88.75 182.583 90.1667 188.25 91L205.5 93.25C222.833 95.4167 235.667 99.75 244 106.25C252.5 112.75 256.75 122.417 256.75 135.25C256.75 149.25 251.917 160 242.25 167.5C232.583 175 218.333 178.75 199.5 178.75H188.5Z";

const DOT_PATH =
  "M285.201 132.084C292.281 132.084 297.408 132.694 300.582 133.915C303.756 135.054 305.343 137.008 305.343 139.774V170.78C305.343 173.547 303.756 175.541 300.582 176.762C297.408 177.901 292.281 178.471 285.201 178.471C278.121 178.471 272.994 177.901 269.82 176.762C266.646 175.541 265.06 173.547 265.06 170.78V139.774C265.06 137.008 266.646 135.054 269.82 133.915C272.994 132.694 278.121 132.084 285.201 132.084Z";

// ─── Timing (seconds) ─────────────────────────────────────────────────────────
const T_START       = 0.15;
const T_DUR         = 0.85;
const S_START       = 0.30;
const S_DUR         = 0.85;
const FILL_START    = 1.15;
const FILL_DUR      = 0.30;
const STROKE_FADE   = FILL_START + FILL_DUR - 0.05;
const DOT_START     = 1.50;
const EXIT_START_MS = 2450;
const EXIT_DUR      = 0.85;

export function LoadingScreen() {
  const [exiting, setExiting] = useState(false);
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    stopScroll();

    const exitTimer = setTimeout(() => setExiting(true), EXIT_START_MS);
    const doneTimer = setTimeout(
      () => { setDone(true); startScroll(); },
      EXIT_START_MS + EXIT_DUR * 1000 + 80,
    );

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      startScroll();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background overflow-hidden"
      initial={{ opacity: 1 }}
      animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      transition={exiting ? { duration: EXIT_DUR, ease: [0.4, 0, 0.8, 1] } : { duration: 0 }}
    >
      {/* ── Subtle grain texture for depth ──────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* ── Corner accent lines ──────────────────────────────────────────── */}
      <CornerLines exiting={exiting} />

      {/* ── Center crosshair flash (before logo draws) ──────────────────── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        {/* Horizontal */}
        <motion.span
          className="absolute top-1/2 left-0 h-[1px] w-full bg-foreground/8 -translate-y-1/2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1, 0] }}
          transition={{ duration: 0.75, ease: "easeInOut", times: [0, 0.45, 1], delay: 0 }}
        />
        {/* Vertical */}
        <motion.span
          className="absolute left-1/2 top-0 w-[1px] h-full bg-foreground/8 -translate-x-1/2"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 0.75, ease: "easeInOut", times: [0, 0.45, 1], delay: 0 }}
        />
      </motion.div>

      {/* ── Logo SVG ────────────────────────────────────────────────────── */}
      <motion.svg
        viewBox="0 0 307 181"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-44 md:w-64 h-auto text-foreground"
        style={{ transformOrigin: "center" }}
        initial={{ scale: 1 }}
        animate={exiting ? { scale: 22 } : { scale: 1 }}
        transition={exiting ? { duration: EXIT_DUR, ease: [0.35, 0, 1, 1] } : { duration: 0 }}
      >
        {/* ── T stroke (draw in) ──────────────────────────────────────── */}
        <motion.path
          d={T_PATH}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: T_DUR, ease: [0.4, 0, 0.2, 1], delay: T_START },
            opacity:    { duration: 0.2, delay: STROKE_FADE },
          }}
        />

        {/* ── T fill (fades in, replacing stroke) ─────────────────────── */}
        <motion.path
          d={T_PATH}
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FILL_DUR, ease: "easeOut", delay: FILL_START }}
        />

        {/* ── S stroke (draw in, slight offset after T) ───────────────── */}
        <motion.path
          d={S_PATH}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: S_DUR, ease: [0.4, 0, 0.2, 1], delay: S_START },
            opacity:    { duration: 0.2, delay: STROKE_FADE },
          }}
        />

        {/* ── S fill ─────────────────────────────────────────────────── */}
        <motion.path
          d={S_PATH}
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FILL_DUR, ease: "easeOut", delay: FILL_START + 0.05 }}
        />

        {/* ── Dot — spring pop, hidden until DOT_START ────────────────── */}
        <motion.path
          d={DOT_PATH}
          fill="#FF3131"
          style={{ transformOrigin: "285.2px 155.4px" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            scale:   { type: "spring", stiffness: 480, damping: 16, delay: DOT_START },
            opacity: { duration: 0.001, delay: DOT_START },
          }}
        />
      </motion.svg>

      {/* ── Progress line — sweeps from left to right over full duration ─ */}
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-0 h-[1px] bg-foreground/12 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        style={{ width: "100%" }}
        transition={{ duration: EXIT_START_MS / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

// ─── Corner decorative lines component ───────────────────────────────────────
function CornerLines({ exiting }: { exiting: boolean }) {
  const base = "absolute bg-foreground/[0.18] pointer-events-none";

  // Each corner has an H and V line growing from its anchor point.
  // We fade them out when exiting.
  const variants = {
    hidden: (axis: "h" | "v") =>
      axis === "h" ? { width: 0, opacity: 1 } : { height: 0, opacity: 1 },
    visible: (axis: "h" | "v") =>
      axis === "h"
        ? { width: "clamp(72px, 20vw, 220px)", opacity: exiting ? 0 : 1 }
        : { height: "clamp(56px, 16vh, 180px)", opacity: exiting ? 0 : 1 },
  };

  const t = (d: number) => ({
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1] as number[],
    delay: d,
  });
  const exitT = { duration: 0.25, ease: "easeIn" as const };

  return (
    <>
      {/* Top-left */}
      <motion.div
        className={`${base} top-5 left-5 h-[1px] origin-left`}
        initial="hidden" custom="h"
        animate={exiting ? { opacity: 0 } : { width: "clamp(72px, 20vw, 220px)", opacity: 1 }}
        transition={exiting ? exitT : t(0.0)}
      />
      <motion.div
        className={`${base} top-5 left-5 w-[1px] origin-top`}
        initial="hidden" custom="v"
        animate={exiting ? { opacity: 0 } : { height: "clamp(56px, 16vh, 180px)", opacity: 1 }}
        transition={exiting ? exitT : t(0.07)}
      />

      {/* Top-right */}
      <motion.div
        className={`${base} top-5 right-5 h-[1px] origin-right`}
        initial="hidden" custom="h"
        animate={exiting ? { opacity: 0 } : { width: "clamp(72px, 20vw, 220px)", opacity: 1 }}
        transition={exiting ? exitT : t(0.04)}
      />
      <motion.div
        className={`${base} top-5 right-5 w-[1px] origin-top`}
        initial="hidden" custom="v"
        animate={exiting ? { opacity: 0 } : { height: "clamp(56px, 16vh, 180px)", opacity: 1 }}
        transition={exiting ? exitT : t(0.11)}
      />

      {/* Bottom-left */}
      <motion.div
        className={`${base} bottom-5 left-5 h-[1px] origin-left`}
        initial="hidden" custom="h"
        animate={exiting ? { opacity: 0 } : { width: "clamp(72px, 20vw, 220px)", opacity: 1 }}
        transition={exiting ? exitT : t(0.06)}
      />
      <motion.div
        className={`${base} bottom-5 left-5 w-[1px] origin-bottom`}
        initial="hidden" custom="v"
        animate={exiting ? { opacity: 0 } : { height: "clamp(56px, 16vh, 180px)", opacity: 1 }}
        transition={exiting ? exitT : t(0.0)}
      />

      {/* Bottom-right */}
      <motion.div
        className={`${base} bottom-5 right-5 h-[1px] origin-right`}
        initial="hidden" custom="h"
        animate={exiting ? { opacity: 0 } : { width: "clamp(72px, 20vw, 220px)", opacity: 1 }}
        transition={exiting ? exitT : t(0.09)}
      />
      <motion.div
        className={`${base} bottom-5 right-5 w-[1px] origin-bottom`}
        initial="hidden" custom="v"
        animate={exiting ? { opacity: 0 } : { height: "clamp(56px, 16vh, 180px)", opacity: 1 }}
        transition={exiting ? exitT : t(0.04)}
      />
    </>
  );
}