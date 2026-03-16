"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { stopScroll, startScroll } from "./lenis-provider";

/* ─── SVG paths ─────────────────────────────────────────────────────────── */
const T_PATH =
  "M83.25 178.25C69.25 178.25 58.25 174.25 50.25 166.25C42.25 158.25 38.25 147.25 38.25 133.25V74.5H2V40.75H38.25V2H75.75V40.75H127V74.5H75.75V133.25C75.75 140.75 79.5 144.5 87 144.5H124.5V178.25H83.25Z";
const S_PATH =
  "M188.5 178.75C177.167 178.75 167.25 177 158.75 173.5C150.25 169.833 143.583 164.833 138.75 158.5C134.083 152.167 131.75 144.75 131.75 136.25H169.25C169.25 140.25 171 143.5 174.5 146C178.167 148.333 182.833 149.5 188.5 149.5H199.5C206.333 149.5 211.5 148.25 215 145.75C218.667 143.25 220.5 139.75 220.5 135.25C220.5 131.083 218.917 127.917 215.75 125.75C212.583 123.417 207.667 121.833 201 121L185 119C167.833 116.833 155.333 112.667 147.5 106.5C139.667 100.333 135.75 90.9167 135.75 78.25C135.75 64.9167 140.333 54.5833 149.5 47.25C158.667 39.9167 172.083 36.25 189.75 36.25H199.25C216.083 36.25 229.5 39.9167 239.5 47.25C249.5 54.5833 254.5 64.4167 254.5 76.75H217C217 73.4167 215.333 70.75 212 68.75C208.833 66.5833 204.583 65.5 199.25 65.5H189.75C183.583 65.5 179.083 66.5833 176.25 68.75C173.417 70.75 172 73.8333 172 78C172 81.8333 173.25 84.75 175.75 86.75C178.417 88.75 182.583 90.1667 188.25 91L205.5 93.25C222.833 95.4167 235.667 99.75 244 106.25C252.5 112.75 256.75 122.417 256.75 135.25C256.75 149.25 251.917 160 242.25 167.5C232.583 175 218.333 178.75 199.5 178.75H188.5Z";
const DOT_PATH =
  "M285.201 132.084C292.281 132.084 297.408 132.694 300.582 133.915C303.756 135.054 305.343 137.008 305.343 139.774V170.78C305.343 173.547 303.756 175.541 300.582 176.762C297.408 177.901 292.281 178.471 285.201 178.471C278.121 178.471 272.994 177.901 269.82 176.762C266.646 175.541 265.06 173.547 265.06 170.78V139.774C265.06 137.008 266.646 135.054 269.82 133.915C272.994 132.694 278.121 132.084 285.201 132.084Z";

/* ─── SVG geometry: dot centre in viewBox space ─────────────────────────── */
const SVG_VB_W  = 307;
const SVG_VB_H  = 181;
const DOT_CX_VB = (265.06  + 305.343) / 2; // ≈ 285.2
const DOT_CY_VB = (132.084 + 178.471) / 2; // ≈ 155.3

/* ─── Easing curves ─────────────────────────────────────────────────────── */
const EASE_DRAW:   [number,number,number,number] = [0.4,  0.0, 0.2, 1.0];
const EASE_INCISE: [number,number,number,number] = [0.16, 1.0, 0.3, 1.0];
const EASE_SPLIT:  [number,number,number,number] = [0.33, 1.0, 0.68, 1.0];

/* ─── Master timing constants ───────────────────────────────────────────── */
const TL = {
  T_DELAY_S:         0.10,
  T_DUR_S:           0.88,
  S_DELAY_S:         0.24,
  S_DUR_S:           0.88,
  FILL_DELAY_S:      1.10,
  FILL_DUR_S:        0.26,
  STROKE_FADE_S:     1.20,
  STROKE_FADE_DUR_S: 0.14,
  // Dot spring fires at 1.52 s, spring settles ≈ 460 ms later → 1980 ms total
  DOT_DELAY_S:       1.52,
  DOT_DELAY_MS:      1520,
  DOT_SETTLE_MS:     460,
  TENSION_MS:        140,   // held pause before the blade moves
  INCISION_DUR_MS:   480,   // line slashes across the screen
  SPLIT_DUR_MS:      880,   // panels peel away
  DONE_BUFFER_MS:    120,
} as const;

// Derived absolute milestones
const INCISION_START_MS = TL.DOT_DELAY_MS + TL.DOT_SETTLE_MS + TL.TENSION_MS; // 2120 ms
const SPLIT_START_MS    = INCISION_START_MS + TL.INCISION_DUR_MS;               // 2600 ms
const DONE_MS           = SPLIT_START_MS    + TL.SPLIT_DUR_MS + TL.DONE_BUFFER_MS; // 3600 ms

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Phase = "drawing" | "incising" | "splitting";

interface Geom {
  cutY:    number; // px from viewport top   — the exact incision Y
  dotX:    number; // px from viewport left  — the blade origin X
  dotXPct: number; // 0–1 fraction of viewport width
  vwH:     number; // viewport height in px
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ─────────────────────────────────────────────────────────────────────────
   Two-effect architecture is intentional and critical:

   Effect 1 — runs once on mount:
     Checks sessionStorage. Sets `isMounted` so the component renders.
     Does NOT attempt measurement here because the logo is not yet in the
     DOM — React hasn't committed the first render yet.

   Effect 2 — runs once when `isMounted` becomes true:
     By the time this fires, React has committed the render that includes
     the logo wrapper, so getBoundingClientRect() returns real values.
     All timers and the geom measurement live here.

   This ordering guarantees that `logoWrapRef.current` is never null.
═══════════════════════════════════════════════════════════════════════════ */
export function LoadingScreen() {
  const [isMounted, setIsMounted] = useState(false);
  const [isFirst,   setIsFirst]   = useState(false);   // true only on first-ever visit
  const [phase,     setPhase]     = useState<Phase>("drawing");
  const [done,      setDone]      = useState(false);
  const [geom,      setGeom]      = useState<Geom | null>(null);

  const logoWrapRef = useRef<HTMLDivElement>(null);

  /* ── Effect 1: mount / session check ───────────────────────────────── */
  useEffect(() => {
    if (sessionStorage.getItem("hasLoadedBefore")) {
      // Returning visitor — skip everything, stay invisible
      setDone(true);
      return;
    }
    // First visit — reveal the loader and proceed to Effect 2
    setIsFirst(true);
    setIsMounted(true);
    stopScroll();
  }, []);

  /* ── Effect 2: measurement + timers ────────────────────────────────── */
  /*
   * Depends on `isMounted`. When Effect 1 calls setIsMounted(true), React
   * commits a re-render before this effect fires, so the logo wrapper is
   * guaranteed to be in the DOM at this point.
   */
  useEffect(() => {
    if (!isMounted) return;

    // Measure dot's absolute position in the rendered viewport
    const el = logoWrapRef.current;
    if (el) {
      const r    = el.getBoundingClientRect();
      const vwW  = window.innerWidth;
      const cutY = r.top  + (DOT_CY_VB / SVG_VB_H) * r.height;
      const dotX = r.left + (DOT_CX_VB / SVG_VB_W) * r.width;
      setGeom({ cutY, dotX, dotXPct: dotX / vwW, vwH: window.innerHeight });
    } else {
      // Defensive fallback — should never be hit but guarantees the
      // animation still runs if ref attachment somehow fails
      setGeom({
        cutY:    window.innerHeight * 0.5,
        dotX:    window.innerWidth  * 0.93,
        dotXPct: 0.93,
        vwH:     window.innerHeight,
      });
    }

    // Phase timeline
    const t1 = setTimeout(() => setPhase("incising"),  INCISION_START_MS);
    const t2 = setTimeout(() => setPhase("splitting"), SPLIT_START_MS);
    const t3 = setTimeout(() => {
      setDone(true);
      sessionStorage.setItem("hasLoadedBefore", "true");
      startScroll();
    }, DONE_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      startScroll();
    };
  }, [isMounted]);

  // Bail out when not needed — must be AFTER all hooks
  if (!isFirst || done) return null;

  const isIncising  = phase === "incising";
  const isSplitting = phase === "splitting";

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" aria-hidden>

      {/* ── Grain texture — tactile depth without visual weight ──────── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/*
       * ── BACKGROUND PANELS ────────────────────────────────────────────
       * While geom is resolving (one frame), a full-cover div prevents
       * any flash of the page beneath. Once geom arrives, it's replaced
       * by two panels tiled at the exact cut line.
       * On "splitting", each panel slides away in its own direction,
       * physically opening the screen along the incision.
       */}
      {!geom ? (
        <div className="absolute inset-0 bg-[#080808] z-[2]" />
      ) : (
        <>
          <motion.div
            className="absolute inset-x-0 top-0 bg-[#080808] z-[2]"
            style={{ bottom: `${geom.vwH - geom.cutY}px`, willChange: "transform" }}
            initial={false}
            animate={isSplitting ? { y: -geom.vwH } : { y: 0 }}
            transition={
              isSplitting
                ? { duration: TL.SPLIT_DUR_MS / 1000, ease: EASE_SPLIT }
                : { duration: 0 }
            }
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-[#080808] z-[2]"
            style={{ top: `${geom.cutY}px`, willChange: "transform" }}
            initial={false}
            animate={isSplitting ? { y: geom.vwH } : { y: 0 }}
            transition={
              isSplitting
                ? { duration: TL.SPLIT_DUR_MS / 1000, ease: EASE_SPLIT, delay: 0.045 }
                : { duration: 0 }
            }
          />
        </>
      )}

      {/*
       * ── LIVE ANIMATED LOGO ────────────────────────────────────────────
       * Visible during "drawing" and "incising" phases. Set to display:none
       * (not opacity:0) the instant splitting begins — the SplitHalf
       * components take over its visual role at the exact same position.
       */}
      {!isSplitting && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[10]">
          <div ref={logoWrapRef} className="w-44 md:w-64">
            <AnimatedLogo />
          </div>
        </div>
      )}

      {/*
       * ── SPLIT LOGO HALVES ─────────────────────────────────────────────
       * Only mounted when splitting begins. Each is a full-viewport
       * container holding a static (fully-resolved) copy of the logo,
       * clipped by inset() to show only its respective half. They animate
       * away with their background panels so the logo appears physically
       * sliced at the incision line.
       *
       * Critical: the logo wrapper inside each SplitHalf must have the
       * same width/centering as the live logo — w-44 md:w-64, centered —
       * so the visual swap is imperceptible.
       */}
      {isSplitting && geom && (
        <>
          <SplitHalf which="top"    geom={geom} />
          <SplitHalf which="bottom" geom={geom} />
        </>
      )}

      {/*
       * ── INCISION LAYER ────────────────────────────────────────────────
       * Mounted at the start of "incising", kept through "splitting" for
       * a single frame, then the fade-out transition handles its removal.
       * The line's transform-origin is pinned to the dot's x-position so
       * scaleX: 0→1 expands bilaterally outward — not from the left edge.
       * An impact bloom fires simultaneously at the origin.
       */}
      {(isIncising || isSplitting) && geom && (
        <IncisionLayer geom={geom} isSplitting={isSplitting} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPLIT HALF
   Full-viewport container, clipped to one half, animates off-screen.
═══════════════════════════════════════════════════════════════════════════ */
function SplitHalf({ which, geom }: { which: "top" | "bottom"; geom: Geom }) {
  const isTop = which === "top";

  // inset() values are relative to the element's own bounding box.
  // Element is inset-0 so its box = full viewport.
  // Top half: clip away everything BELOW cutY.
  // Bottom half: clip away everything ABOVE cutY.
  const clipPath = isTop
    ? `inset(0 0 ${geom.vwH - geom.cutY}px 0)`
    : `inset(${geom.cutY}px 0 0 0)`;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-[10]"
      style={{ clipPath, willChange: "transform" }}
      initial={{ y: 0 }}
      animate={{ y: isTop ? -geom.vwH : geom.vwH }}
      transition={{
        duration: TL.SPLIT_DUR_MS / 1000,
        ease:     EASE_SPLIT,
        delay:    isTop ? 0 : 0.045,
      }}
    >
      {/* Same sizing as the live logo — pixel-perfect positional alignment */}
      <div className="w-44 md:w-64 flex-shrink-0">
        <StaticLogo />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INCISION LAYER
   The red dot's x-position becomes the bilateral origin of a 1px cut.
═══════════════════════════════════════════════════════════════════════════ */
function IncisionLayer({ geom, isSplitting }: { geom: Geom; isSplitting: boolean }) {
  const durS = TL.INCISION_DUR_MS / 1000;

  return (
    <>
      {/*
       * The slash line.
       * `transformOrigin` is the blade's x-coordinate so scaleX:0→1
       * races outward left AND right simultaneously from that point.
       * Because the dot sits right-of-centre, the left race dominates —
       * a directional energy that reads as a decisive cut, not a sweep.
       *
       * When `isSplitting` starts, the line fades out (the wound is open).
       * The scaleX stays at 1 while only opacity animates to 0.
       */}
      <motion.div
        className="absolute left-0 right-0 pointer-events-none z-[30]"
        style={{
          top:             geom.cutY - 0.5,
          height:          1,
          background:      "#FF3131",
          transformOrigin: `${geom.dotXPct * 100}% 50%`,
          willChange:      "transform, opacity",
        }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={
          isSplitting
            ? { scaleX: 1, opacity: 0 }
            : { scaleX: 1, opacity: 1 }
        }
        transition={
          isSplitting
            ? { opacity: { duration: 0.25, ease: "easeOut" } }
            : { scaleX:  { duration: durS,  ease: EASE_INCISE } }
        }
      />

      {/*
       * Impact bloom — fires once the instant the blade begins moving.
       * A radial burst at the origin gives the cut physical weight.
       * Fully dissolved before the split begins.
       */}
      {!isSplitting && (
        <motion.div
          className="absolute rounded-full pointer-events-none z-[30]"
          style={{
            top:        geom.cutY - 10,
            left:       geom.dotX - 10,
            width:      20,
            height:     20,
            background: "#FF3131",
            willChange: "transform, opacity",
          }}
          initial={{ scale: 0.4, opacity: 0.9 }}
          animate={{ scale: 5.0, opacity: 0 }}
          transition={{ duration: durS * 0.55, ease: "easeOut" }}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED LOGO
   Stroke-draw + fill crossfade + dot spring. Used during drawing/incising.
═══════════════════════════════════════════════════════════════════════════ */
function AnimatedLogo() {
  return (
    <svg
      viewBox="0 0 307 181"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto text-white"
      style={{ overflow: "visible" }}
    >
      {/* T stroke → fill crossfade */}
      <motion.path
        d={T_PATH}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 0 }}
        transition={{
          pathLength: { duration: TL.T_DUR_S, ease: EASE_DRAW, delay: TL.T_DELAY_S },
          opacity:    { duration: TL.STROKE_FADE_DUR_S, delay: TL.STROKE_FADE_S },
        }}
      />
      <motion.path
        d={T_PATH}
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: TL.FILL_DUR_S, ease: "easeOut", delay: TL.FILL_DELAY_S }}
      />

      {/* S stroke → fill crossfade — overlaps T by 0.14 s (single gesture feel) */}
      <motion.path
        d={S_PATH}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 0 }}
        transition={{
          pathLength: { duration: TL.S_DUR_S, ease: EASE_DRAW, delay: TL.S_DELAY_S },
          opacity:    { duration: TL.STROKE_FADE_DUR_S, delay: TL.STROKE_FADE_S + 0.03 },
        }}
      />
      <motion.path
        d={S_PATH}
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: TL.FILL_DUR_S, ease: "easeOut", delay: TL.FILL_DELAY_S + 0.04 }}
      />

      {/* Red dot — spring snap. This impact CAUSES the incision. */}
      <motion.path
        d={DOT_PATH}
        fill="#FF3131"
        style={{ transformOrigin: `${DOT_CX_VB}px ${DOT_CY_VB}px` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          scale:   { type: "spring", stiffness: 580, damping: 18, delay: TL.DOT_DELAY_S },
          opacity: { duration: 0.001, delay: TL.DOT_DELAY_S },
        }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATIC LOGO
   Fully resolved state. Used inside SplitHalf so the sliced halves are
   visually identical to the live logo at the moment of the cut.
═══════════════════════════════════════════════════════════════════════════ */
function StaticLogo() {
  return (
    <svg
      viewBox="0 0 307 181"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto text-white"
    >
      <path d={T_PATH}   fill="currentColor" />
      <path d={S_PATH}   fill="currentColor" />
      <path d={DOT_PATH} fill="#FF3131" />
    </svg>
  );
}