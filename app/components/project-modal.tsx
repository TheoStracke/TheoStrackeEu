"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";

// ── Types (self-contained) ──

export interface ProjectModalProps {
  title: string;
  description?: string;
  technologies: string[];
  href: string;
  gallery: string[];
  logo: string;
  visitLabel?: string;
  isOpen: boolean;
  onClose: () => void;
}

// ── Easing curves ──

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const CIRC: [number, number, number, number] = [0.55, 0, 1, 0.45];

// ── Animation Variants ──

const backdropV: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EXPO } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: CIRC } },
};

const panelV: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 40, rotateX: 6 },
  visible: { opacity: 1, scale: 1, y: 0, rotateX: 0, transition: { duration: 0.65, ease: EXPO } },
  exit: { opacity: 0, scale: 0.94, y: 20, rotateX: 3, transition: { duration: 0.4, ease: CIRC } },
};

const slideV: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? 50 : -50, scale: 0.96 }),
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: (d: number) => ({
    opacity: 0,
    x: d > 0 ? -50 : 50,
    scale: 0.96,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

// ── Inline Hooks ──

/** Keyboard navigation: Escape closes, arrows navigate. */
function useModalKeys(onClose: () => void, onPrev: () => void, onNext: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);
}

/** Simple swipe detection for touch/pointer navigation. */
function useSwipe(onNext: () => void, onPrev: () => void) {
  const startX = useRef<number | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => { startX.current = e.clientX; },
    onPointerUp: (e: React.PointerEvent) => {
      if (startX.current === null) return;
      const delta = e.clientX - startX.current;
      if (Math.abs(delta) > 44) { delta < 0 ? onNext() : onPrev(); }
      startX.current = null;
    },
  };
}

// ── Liquid Glass Constants ──

const GLASS_BG = "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.06) 100%)";
const GLASS_BLUR = "blur(48px) saturate(180%)";
const GLASS_SHADOW = "inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(255,255,255,0.1), inset 1px 0 1px rgba(255,255,255,0.2), inset -1px 0 1px rgba(255,255,255,0.2), 0 32px 64px -16px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(0,0,0,0.3)";

// ── Blob Nav Button ──

const BW = 56, BH = 140;
const LEFT_PATH = `M ${BW},0 C ${BW * 0.5},0 0,${BH * 0.2} 0,${BH / 2} C 0,${BH * 0.8} ${BW * 0.5},${BH} ${BW},${BH} Z`;
const RIGHT_PATH = `M 0,0 C ${BW * 0.5},0 ${BW},${BH * 0.2} ${BW},${BH / 2} C ${BW},${BH * 0.8} ${BW * 0.5},${BH} 0,${BH} Z`;

function NavBlob({ dir, onClick, disabled }: { dir: "left" | "right"; onClick: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false);
  const isLeft = dir === "left";
  const path = isLeft ? LEFT_PATH : RIGHT_PATH;
  const scaleRaw = useMotionValue(1);
  const scale = useSpring(scaleRaw, { stiffness: 400, damping: 25 });

  return (
    <AnimatePresence>
      {!disabled && (
        <motion.button
          key={dir}
          onClick={onClick}
          onMouseEnter={() => { setHovered(true); scaleRaw.set(1.1); }}
          onMouseLeave={() => { setHovered(false); scaleRaw.set(1); }}
          initial={{ opacity: 0, x: isLeft ? -16 : 16 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: EXPO, delay: 0.15 } }}
          exit={{ opacity: 0, x: isLeft ? -10 : 10, transition: { duration: 0.2 } }}
          className="focus:outline-none z-0 relative group will-change-transform"
          style={{
            scale, width: BW, height: BH, flexShrink: 0,
            clipPath: `path('${path}')`,
            background: GLASS_BG,
            backdropFilter: GLASS_BLUR,
            WebkitBackdropFilter: GLASS_BLUR,
            transform: "translate3d(0,0,0)",
          }}
        >
          {/* Inner reflection */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-70 group-hover:opacity-100"
            style={{
              clipPath: `path('${path}')`,
              boxShadow: isLeft
                ? "inset 1px 1px 2px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(255,255,255,0.1)"
                : "inset -1px 1px 2px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(255,255,255,0.1)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
            }}
          />
          {/* Chevron with micro-animation */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ x: hovered ? (isLeft ? -5 : 5) : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ marginLeft: isLeft ? -8 : 8 }}
          >
            {isLeft
              ? <ChevronLeft size={24} className="text-white drop-shadow-md" />
              : <ChevronRight size={24} className="text-white drop-shadow-md" />}
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ── Sheen keyframes ──
const SHEEN_STYLE = `@keyframes sheen-sweep{0%{transform:translateX(-100%) rotate(12deg)}100%{transform:translateX(200%) rotate(12deg)}}`;

// ── Modal Core ──

function ModalCore({
  title,
  description,
  technologies,
  href,
  gallery,
  logo,
  onClose,
  visitLabel = "Visit",
}: Omit<ProjectModalProps, "isOpen">) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const isTransitioning = useRef(false);

  // Cursor-following radial backdrop
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  const handleBackdropMove = useCallback(
    (e: React.MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    },
    [mouseX, mouseY]
  );

  const goTo = useCallback(
    (n: number) => {
      if (isTransitioning.current || n === idx || n < 0 || n >= gallery.length) return;
      isTransitioning.current = true;
      setDir(n > idx ? 1 : -1);
      setIdx(n);
      setTimeout(() => { isTransitioning.current = false; }, 380);
    },
    [idx, gallery.length]
  );

  useModalKeys(onClose, () => goTo(idx - 1), () => goTo(idx + 1));
  const swipeHandlers = useSwipe(() => goTo(idx + 1), () => goTo(idx - 1));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      style={{ perspective: "1000px" }}
      onMouseMove={handleBackdropMove}
    >
      <style dangerouslySetInnerHTML={{ __html: SHEEN_STYLE }} />

      {/* ── CINEMATIC BACKDROP ── */}
      <motion.div
        className="absolute inset-0"
        variants={backdropV}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        style={{
          background: `radial-gradient(800px circle at calc(${smoothX.get() * 100}%) calc(${smoothY.get() * 100}%), hsla(210,60%,30%,0.25), hsla(240,6%,6%,0.85) 60%)`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      />

      <motion.div
        className="relative z-10 flex items-center justify-center w-full max-w-6xl h-full max-h-[85vh] group/modal"
        variants={panelV}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* LEFT NAV */}
        <div className="hidden md:flex items-center -mr-1 z-0">
          <NavBlob dir="left" onClick={() => goTo(idx - 1)} disabled={idx === 0} />
        </div>

        {/* ── MAIN LIQUID GLASS PANEL ── */}
        <div
          className="relative flex flex-col w-full h-full overflow-hidden rounded-[2.5rem] z-10"
          style={{
            background: GLASS_BG,
            backdropFilter: GLASS_BLUR,
            WebkitBackdropFilter: GLASS_BLUR,
            boxShadow: GLASS_SHADOW,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {/* Sheen sweep overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] overflow-hidden z-20">
            <div
              className="absolute -inset-full w-[50%] h-full opacity-[0.07]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                animation: "sheen-sweep 3s ease-in-out infinite",
              }}
            />
          </div>

          {/* Top edge highlight */}
          <div className="pointer-events-none absolute top-0 inset-x-0 h-px z-50 opacity-50" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent)" }} />

          {/* Gradient overlay for depth */}
          <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] opacity-40 z-20 mix-blend-overlay" style={{ background: "linear-gradient(to bottom right, rgba(255,255,255,0.05), transparent, transparent)" }} />

          {/* ── HEADER ── */}
          <div className="relative z-30 flex-shrink-0 flex items-start justify-between p-6 sm:p-8 pb-4">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-center">
                <Image src={logo} alt={title} width={350} height={100} className="h-20 w-auto object-contain drop-shadow-lg" priority />
              </div>
              {description && (
                <p className="text-sm sm:text-base text-white/70 text-center font-medium leading-relaxed max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-90 flex-shrink-0"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* ── IMAGE GALLERY ── */}
          <div className="relative z-30 flex-1 min-h-0 w-full px-6 sm:px-8 pb-6" {...swipeHandlers}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={idx}
                custom={dir}
                variants={slideV}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 px-6 sm:px-8 pb-6 flex items-center justify-center will-change-transform"
                style={{ transform: "translate3d(0,0,0)" }}
              >
                {/* Recessed glass image container */}
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden backdrop-blur-md"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    boxShadow: "inset 0 4px 24px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Image
                    src={gallery[idx]}
                    alt={`${title} screenshot ${idx + 1}`}
                    fill
                    className="object-contain drop-shadow-2xl p-2"
                    quality={100}
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                  {/* Vignette */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)" }} />
                  {/* Inner reflection */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── FOOTER ── */}
          <div className="relative z-30 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 border-t border-white/10 bg-white/[0.03] gap-4 backdrop-blur-lg">
            {/* Tech badges */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/90 bg-white/10 border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all duration-300 hover:bg-white/15 hover:shadow-[0_0_12px_rgba(130,180,255,0.2)]"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6">
              {/* Dot indicators */}
              <div className="flex gap-2 bg-black/20 px-3 py-2 rounded-full border border-white/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)]">
                {gallery.map((_: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === idx
                        ? "w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>

              {/* Visit button with micro-interaction */}
              <motion.a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group/btn flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-300"
                whileHover={{ scale: 1.06, boxShadow: "0 0 30px rgba(130,180,255,0.35)" }}
                whileTap={{ scale: 0.97 }}
              >
                {visitLabel}{" "}
                <ArrowUpRight size={16} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* RIGHT NAV */}
        <div className="hidden md:flex items-center -ml-1 z-0">
          <NavBlob dir="right" onClick={() => goTo(idx + 1)} disabled={idx === gallery.length - 1} />
        </div>
      </motion.div>
    </div>
  );
}

// ── Modal Wrapper (Portal + Scroll Lock) ──

export function ProjectModal({ isOpen, ...rest }: ProjectModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.paddingRight = `${scrollbarWidth}px`;

    // Disable Lenis if present
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    if (lenis?.stop) lenis.stop();

    // Capture-phase scroll prevention
    const blockWheel = (e: WheelEvent) => { e.preventDefault(); e.stopPropagation(); };
    const blockTouch = (e: TouchEvent) => { e.preventDefault(); e.stopPropagation(); };
    const blockKeys = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) {
        e.preventDefault();
      }
    };

    document.addEventListener("wheel", blockWheel, { capture: true, passive: false });
    document.addEventListener("touchmove", blockTouch, { capture: true, passive: false });
    document.addEventListener("keydown", blockKeys, { capture: true });

    return () => {
      document.removeEventListener("wheel", blockWheel, true);
      document.removeEventListener("touchmove", blockTouch, true);
      document.removeEventListener("keydown", blockKeys, true);

      if (lenis?.start) lenis.start();

      html.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflow = "";
      body.style.paddingRight = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>{isOpen && <ModalCore {...rest} />}</AnimatePresence>,
    document.body
  );
}
