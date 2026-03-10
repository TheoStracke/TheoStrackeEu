"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ProjectModal } from "./project-modal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectCardProps {
  title: string;
  description: string;
  technologies: string[];
  href: string;
  thumbnail: string;
  gallery: string[];
  logo: string;
  hoverCtaText?: string;
  visitLabel?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Global noise SVG filter (injected once, reused via CSS)
// ─────────────────────────────────────────────────────────────────────────────

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E`;

// ─────────────────────────────────────────────────────────────────────────────
// Hook — smooth rAF-throttled mouse position relative to an element
// ─────────────────────────────────────────────────────────────────────────────

function useRelativeMouse(ref: React.RefObject<HTMLElement | null>) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rafId = useRef<number | null>(null);

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        if (!ref.current) { rafId.current = null; return; }
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width);
        y.set((e.clientY - r.top) / r.height);
        rafId.current = null;
      });
    },
    [ref, x, y]
  );

  const onLeave = useCallback(() => {
    if (rafId.current) { cancelAnimationFrame(rafId.current); rafId.current = null; }
    x.set(0.5);
    y.set(0.5);
  }, [x, y]);

  return { x, y, onMove, onLeave };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook — magnetic pull toward cursor for a child element
// ─────────────────────────────────────────────────────────────────────────────

const MAGNET_RADIUS = 90;   // px — how far away the magnet activates
const MAGNET_STRENGTH = 0.4; // 0–1 pull factor

function useMagnet() {
  const btnRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.6 });
  const springY = useSpring(my, { stiffness: 220, damping: 18, mass: 0.6 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const parent = btn.closest("[data-card]") as HTMLElement | null;
    if (!parent) return;

    const onMove = (e: MouseEvent) => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < MAGNET_RADIUS) {
          const pull = (1 - dist / MAGNET_RADIUS) * MAGNET_STRENGTH;
          mx.set(dx * pull * 2.2);
          my.set(dy * pull * 2.2);
        } else {
          mx.set(0);
          my.set(0);
        }
        rafId.current = null;
      });
    };

    const onLeave = () => { mx.set(0); my.set(0); };

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my]);

  return { btnRef, springX, springY };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cursor follower inside thumbnail
// ─────────────────────────────────────────────────────────────────────────────

interface CursorFollowerProps {
  visible: boolean;
  relX: MotionValue<number>;
  relY: MotionValue<number>;
  containerW: number;
  containerH: number;
}

function CursorFollower({ visible, relX, relY, containerW, containerH }: CursorFollowerProps) {
  const PILL_W = 110;
  const PILL_H = 44;

  const rawX = useTransform(relX, (v) => v * containerW - PILL_W / 2);
  const rawY = useTransform(relY, (v) => v * containerH - PILL_H / 2);
  const x = useSpring(rawX, { stiffness: 180, damping: 22, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 180, damping: 22, mass: 0.5 });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute flex items-center justify-center"
            style={{ x, y, width: PILL_W, height: PILL_H }}
          >
            <div
              className="absolute inset-0 rounded-full blur-lg opacity-60"
              style={{ background: "rgba(255,255,255,0.35)" }}
            />
            <div
              className="relative flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-900"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 2px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <ArrowUpRight size={12} strokeWidth={2.5} />
              View
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectCard(props: ProjectCardProps) {
  const {
    title,
    description,
    technologies,
    thumbnail,
    logo,
    visitLabel = "Visit",
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ── Refs ──
  const cardRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbSize, setThumbSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!thumbRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setThumbSize({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    ro.observe(thumbRef.current);
    return () => ro.disconnect();
  }, []);

  // ── 3D tilt (luxurious spring) ──
  const cardX = useMotionValue(0.5);
  const cardY = useMotionValue(0.5);
  const cardRafId = useRef<number | null>(null);

  const rotateX = useSpring(
    useTransform(cardY, [0, 1], [10, -10]),
    { stiffness: 100, damping: 30, mass: 1 }
  );
  const rotateY = useSpring(
    useTransform(cardX, [0, 1], [-10, 10]),
    { stiffness: 100, damping: 30, mass: 1 }
  );

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRafId.current) return;
    const target = e.currentTarget;
    const cx = e.clientX, cy = e.clientY;
    cardRafId.current = requestAnimationFrame(() => {
      const r = target.getBoundingClientRect();
      cardX.set((cx - r.left) / r.width);
      cardY.set((cy - r.top) / r.height);
      cardRafId.current = null;
    });
  }, [cardX, cardY]);

  const handleCardMouseLeave = useCallback(() => {
    if (cardRafId.current) { cancelAnimationFrame(cardRafId.current); cardRafId.current = null; }
    cardX.set(0.5);
    cardY.set(0.5);
  }, [cardX, cardY]);

  // ── Dynamic glare (follows mouse across whole card) ──
  const glareX = useTransform(cardX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(cardY, [0, 1], ["0%", "100%"]);
  const glareOpacity = useSpring(0, { stiffness: 120, damping: 20 });

  // ── Thumbnail parallax + cursor follower ──
  const { x: thumbRelX, y: thumbRelY, onMove: onThumbMove, onLeave: onThumbLeave } =
    useRelativeMouse(thumbRef);

  const thumbParallaxX = useSpring(
    useTransform(thumbRelX, [0, 1], [-12, 12]),
    { stiffness: 120, damping: 25, mass: 0.8 }
  );
  const thumbParallaxY = useSpring(
    useTransform(thumbRelY, [0, 1], [-8, 8]),
    { stiffness: 120, damping: 25, mass: 0.8 }
  );

  // ── Magnetic CTA ──
  const { btnRef: magnetRef, springX: magnetX, springY: magnetY } = useMagnet();

  // ── Badge stagger ──
  const badgeVariants = {
    rest:  { y: 0,   opacity: 1 },
    hover: (i: number) => ({
      y: -3,
      opacity: 1,
      transition: { delay: i * 0.04, type: "spring" as const, stiffness: 300, damping: 20 },
    }),
  };

  return (
    <>
      {/* ── Card wrapper com Acessibilidade ── */}
      <div
        data-card
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={`Ver detalhes do projeto ${title}`}
        className="group block h-full cursor-none select-none outline-none focus-visible:ring-4 focus-visible:ring-ink/20 rounded-[28px]"
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        onMouseEnter={() => { setIsHovered(true); glareOpacity.set(1); }}
        onMouseLeave={() => { setIsHovered(false); glareOpacity.set(0); handleCardMouseLeave(); }}
        onMouseMove={handleCardMouseMove}
      >
        <motion.div
          className="relative flex h-full flex-col overflow-hidden rounded-[28px] will-change-transform"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            transform: "translate3d(0,0,0)",
            background: "linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(248,248,252,0.58) 100%)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
            border: "1px solid rgba(255,255,255,0.55)",
            backdropFilter: "blur(20px)",
          }}
          animate={{
            boxShadow: isHovered
              ? "0 28px 80px rgba(0,0,0,0.14), 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)"
              : "0 4px 24px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
          transition={{ duration: 0.45 }}
        >
          {/* Noise grain overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-[28px] opacity-[0.025] mix-blend-overlay"
            style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundSize: "256px 256px" }}
          />

          {/* ── Dynamic glare sheen ── */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 rounded-[28px]"
            style={{
              opacity: glareOpacity,
              background: useTransform(
                [glareX, glareY] as MotionValue[],
                ([x, y]: string[]) =>
                  `radial-gradient(480px circle at ${x} ${y}, rgba(255,255,255,0.22) 0%, transparent 60%)`
              ),
            }}
          />

          {/* ── Thumbnail ── */}
          <div
            ref={thumbRef}
            className="relative h-[240px] w-full flex-shrink-0 overflow-hidden bg-neutral-100 sm:h-[280px]"
            onMouseMove={(e) => onThumbMove(e.nativeEvent)}
            onMouseLeave={() => { onThumbLeave(); }}
          >
            {/* Parallax image */}
            <motion.div
              className="absolute inset-[-12px]"
              style={{ x: thumbParallaxX, y: thumbParallaxY }}
            >
              <Image
                src={thumbnail}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-top"
                priority={false}
              />
            </motion.div>

            {/* Subtle vignette at bottom */}
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 55%)" }}
            />

            {/* Cursor follower */}
            <CursorFollower
              visible={isHovered}
              relX={thumbRelX}
              relY={thumbRelY}
              containerW={thumbSize.w}
              containerH={thumbSize.h}
            />
          </div>

          {/* ── Card Body ── */}
          <div className="relative flex flex-1 flex-col justify-between px-6 py-8 sm:px-8 sm:py-9">
            {/* Subtle inner top border to reinforce glass layering */}
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)" }}
            />

            <div className="relative space-y-3">
              {/* Logo */}
              <div className="flex items-center justify-center min-h-[4rem]">
                <motion.div
                  animate={{ scale: isHovered ? 1.04 : 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <Image
                    src={logo}
                    alt={title}
                    width={240}
                    height={80}
                    className="h-16 w-auto object-contain"
                    priority
                  />
                </motion.div>
              </div>

              {/* ── Magnetic CTA Arrow ── */}
              <motion.div
                ref={magnetRef}
                className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-full cursor-none"
                style={{ x: magnetX, y: magnetY }}
                animate={{
                  background: isHovered ? "rgba(8,8,10,1)" : "rgba(246,246,248,1)",
                  boxShadow: isHovered
                    ? "0 0 0 1px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.22)"
                    : "0 0 0 1px rgba(0,0,0,0.06)",
                }}
                transition={{ duration: 0.22 }}
              >
                <motion.div
                  animate={{
                    x: isHovered ? 2 : 0,
                    y: isHovered ? -2 : 0,
                    color: isHovered ? "#ffffff" : "#0a0a0a",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  <ArrowUpRight size={17} strokeWidth={2} />
                </motion.div>
              </motion.div>

              {/* Description */}
              <p className="text-sm leading-relaxed text-neutral-500 tracking-[-0.01em]">
                {description}
              </p>
            </div>

            {/* ── Technology badges with stagger ── */}
            <motion.div
              className="mt-6 flex flex-wrap gap-1.5"
              animate={isHovered ? "hover" : "rest"}
              initial="rest"
            >
              {technologies.map((tech, i) => (
                <motion.span
                  key={tech}
                  custom={i}
                  variants={badgeVariants}
                  className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(0,0,0,0.07)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                  whileHover={{
                    background: "rgba(255,255,255,0.95)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)",
                    color: "rgba(10,10,10,0.9)",
                  }}
                  transition={{ duration: 0.18 }}
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Bottom edge highlight - Corrigido para a tua cor de Accent (Laranja) */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-b-[28px] pointer-events-none"
            style={{
              // Usando o RGB do teu Laranja #D95F2A = 217, 95, 42
              background: "linear-gradient(90deg, transparent 0%, rgba(217,95,42,0.65) 50%, transparent 100%)",
            }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      </div>

      <ProjectModal
        {...props}
        visitLabel={visitLabel}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}