"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { stopScroll, startScroll } from "./lenis-provider";

// ═══════════════════════════════════════════════════════════════════════════
// Types & Configuration
// ═══════════════════════════════════════════════════════════════════════════

export interface NeuralOverlayProps {
  skills: string[];
  title: string;
  logo?: string;
  isOpen: boolean;
  onClose: () => void;
  subtitle?: string;
  closeLabel?: string;
  showMouseGlow?: boolean;
}

// Configuração das órbitas: raio (mobile/desktop), direção da rotação, velocidade
const ORBIT_CONFIG = [
  { radiusMobile: 100, radiusDesktop: 175, direction: 1,  duration: 18 },
  { radiusMobile: 155, radiusDesktop: 275, direction: -1, duration: 28 },
  { radiusMobile: 210, radiusDesktop: 375, direction: 1,  duration: 40 },
] as const;

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.6, 1] },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Utility — distribui as skills nas 3 órbitas
// ═══════════════════════════════════════════════════════════════════════════

function distributeSkills(skills: string[]): [string[], string[], string[]] {
  const total = skills.length;
  const base = Math.floor(total / 3);
  const extra = total % 3;
  const counts = [base, base + (extra >= 2 ? 1 : 0), base + (extra >= 1 ? 1 : 0)];
  let idx = 0;
  return counts.map((c) => {
    const chunk = skills.slice(idx, idx + c);
    idx += c;
    return chunk;
  }) as [string[], string[], string[]];
}

// ═══════════════════════════════════════════════════════════════════════════
// Decorative SVG ring (static, thin, glowing)
// ═══════════════════════════════════════════════════════════════════════════

interface OrbitRingProps {
  radius: number;
  orbitIndex: number;
  isHovered: boolean;
}

function OrbitRing({ radius, orbitIndex, isHovered }: OrbitRingProps) {
  const size = radius * 2 + 4;
  const cx = size / 2;
  const baseOpacity = [0.25, 0.18, 0.12][orbitIndex];

  return (
    <motion.svg
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{ x: "-50%", y: "-50%" }}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.6, delay: orbitIndex * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <motion.circle
        cx={cx}
        cy={cx}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
        strokeDasharray="4 12"
        animate={{ opacity: isHovered ? 0.55 : baseOpacity }}
        transition={{ duration: 0.4 }}
      />
      <motion.circle
        cx={cx}
        cy={cx}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
        animate={{ opacity: isHovered ? 0.4 : 0.1 }}
        transition={{ duration: 0.4 }}
      />
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Single skill pill that counter-rotates to stay legible
// ═══════════════════════════════════════════════════════════════════════════

interface SkillPillProps {
  skill: string;
  ringRotation: number;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

function SkillPill({ skill, ringRotation, onHoverStart, onHoverEnd }: SkillPillProps) {
  // CORREÇÃO: Apenas invertemos a rotação do anel pai para manter o texto 100% alinhado na horizontal
  const counterRotate = -ringRotation;

  return (
    <motion.div
      className="group cursor-default"
      style={{ rotate: counterRotate }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      whileHover={{ scale: 1.12 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
    >
      <div
        className="
          relative rounded-md px-3 py-1.5 md:px-4 md:py-2
          bg-black/55 backdrop-blur-xl
          border border-white/25
          text-white font-medium tracking-wider
          text-[10px] md:text-sm
          shadow-[0_0_12px_rgba(255,255,255,0.07)]
          transition-all duration-300
          group-hover:bg-black/70
          group-hover:border-white/55
          group-hover:shadow-[0_0_22px_rgba(255,255,255,0.2)]
          whitespace-nowrap
        "
      >
        <span className="relative z-10">{skill}</span>
        <div className="absolute inset-0 rounded-md bg-gradient-to-b from-white/8 to-transparent opacity-60 pointer-events-none" />
        <span className="absolute top-0.5 left-1 w-0.5 h-0.5 rounded-full bg-white/40 group-hover:bg-white/80 transition-colors" />
        <span className="absolute bottom-0.5 right-1 w-0.5 h-0.5 rounded-full bg-white/40 group-hover:bg-white/80 transition-colors" />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Orbit layer — rotates as a whole; nodes counter-rotate
// ═══════════════════════════════════════════════════════════════════════════

interface OrbitLayerProps {
  skills: string[];
  radius: number;
  orbitIndex: number;
  direction: 1 | -1;
  duration: number;
}

function OrbitLayer({ skills, radius, orbitIndex, direction, duration }: OrbitLayerProps) {
  const [rotation, setRotation] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const degreesPerMs = (360 / (duration * 1000)) * direction;

    const tick = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current;
        if (!pausedRef.current) {
          rotationRef.current = (rotationRef.current + degreesPerMs * delta) % 360;
          setRotation(rotationRef.current);
        }
      }
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, direction]);

  useEffect(() => {
    pausedRef.current = hoveredIndex !== null;
  }, [hoveredIndex]);

  const nodeAngles = useMemo(
    () => skills.map((_, i) => (360 / skills.length) * i),
    [skills.length]
  );

  if (!skills.length) return null;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{ x: "-50%", y: "-50%", rotate: rotation }}
    >
      {skills.map((skill, i) => {
        const angleRad = (nodeAngles[i] * Math.PI) / 180;
        const x = radius * Math.cos(angleRad);
        const y = radius * Math.sin(angleRad);

        return (
          <motion.div
            key={skill}
            className="absolute pointer-events-auto"
            style={{
              left: "50%",
              top: "50%",
              x: x,
              y: y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{
              opacity: { duration: 0.4, delay: orbitIndex * 0.1 + i * 0.06 },
              scale: {
                type: "spring",
                stiffness: 160,
                damping: 16,
                delay: orbitIndex * 0.1 + i * 0.06,
              },
            }}
          >
            <SkillPill
              skill={skill}
              ringRotation={rotation}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HUD decorative corner brackets
// ═══════════════════════════════════════════════════════════════════════════

function HudCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");

  return (
    <motion.div
      className={`absolute w-8 h-8 md:w-12 md:h-12 ${isTop ? "top-4 md:top-6" : "bottom-4 md:bottom-6"} ${isLeft ? "left-4 md:left-6" : "right-4 md:right-6"} pointer-events-none`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.4, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div
        className={`absolute top-0 left-0 w-full h-full border-white/40`}
        style={{
          borderTopWidth: isTop ? "1px" : 0,
          borderBottomWidth: isTop ? 0 : "1px",
          borderLeftWidth: isLeft ? "1px" : 0,
          borderRightWidth: isLeft ? 0 : "1px",
        }}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Central pulsing hub
// ═══════════════════════════════════════════════════════════════════════════

interface CentralHubProps {
  title: string;
  logo?: string;
}

function CentralHub({ title, logo }: CentralHubProps) {
  return (
    <motion.div
      className="relative z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.1 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-white/5 border border-white/20"
        style={{ margin: "-20px" }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-white/15"
        style={{ margin: "-38px" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0, 0.25] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
      />

      <motion.div
        className="
          relative w-28 h-28 md:w-36 md:h-36
          rounded-full
          bg-white
          border-2 border-white/30
          shadow-[0_0_50px_rgba(255,255,255,0.35),0_0_100px_rgba(255,255,255,0.15)]
          flex items-center justify-center overflow-hidden
        "
        animate={{
          scale: [1, 1.03, 1],
          boxShadow: [
            "0 0 50px rgba(255,255,255,0.35), 0 0 100px rgba(255,255,255,0.15)",
            "0 0 70px rgba(255,255,255,0.5), 0 0 140px rgba(255,255,255,0.25)",
            "0 0 50px rgba(255,255,255,0.35), 0 0 100px rgba(255,255,255,0.15)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-2 rounded-full border border-black/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage:
              "repeating-conic-gradient(rgba(0,0,0,0.04) 0deg 10deg, transparent 10deg 20deg)",
          }}
        />

        {logo ? (
          <img src={logo} alt={title} className="relative z-10 w-3/5 h-3/5 object-contain" />
        ) : (
          <p className="relative z-10 text-black/80 font-bold text-xs md:text-sm text-center leading-tight px-2 tracking-wide uppercase">
            {title}
          </p>
        )}

        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-black/5 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main NeuralOverlay — Quantum Core variant
// ═══════════════════════════════════════════════════════════════════════════

export function NeuralOverlay({
  skills,
  title,
  logo,
  isOpen,
  onClose,
  subtitle = "Skills & Technologies",
  closeLabel = "Close",
  showMouseGlow = true,
}: NeuralOverlayProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredOrbit, setHoveredOrbit] = useState<number | null>(null);

 useEffect(() => {
    // Trocamos window.innerWidth pelo clientWidth para ignorar a barra de rolagem
    const check = () => setIsMobile(document.documentElement.clientWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [orbit0Skills, orbit1Skills, orbit2Skills] = useMemo(
    () => distributeSkills(skills),
    [skills]
  );
  const orbitSkills = [orbit0Skills, orbit1Skills, orbit2Skills];

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (showMouseGlow) setMousePos({ x: e.clientX, y: e.clientY });
    },
    [showMouseGlow]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen || !showMouseGlow) return;
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen, showMouseGlow, handleMouseMove]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen) return;
    const currentScrollY = window.scrollY;
    stopScroll();
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${currentScrollY}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, currentScrollY);
      startScroll();
    };
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="quantum-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quantum-overlay-title"
          aria-describedby="quantum-overlay-description"
        >
          <div className="absolute inset-0 backdrop-blur-2xl bg-black/75">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0.8)_70%,black_100%)]" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,0.5) 32px)",
              }}
            />
            {showMouseGlow && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.055), transparent 40%)`,
                }}
              />
            )}
          </div>

          <HudCorner position="tl" />
          <HudCorner position="tr" />
          <HudCorner position="bl" />
          <HudCorner position="br" />

          <motion.div
            className="absolute top-6 left-6 md:top-10 md:left-10 z-50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.2, duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h2
              id="quantum-overlay-title"
              className="text-xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight"
            >
              {title}
            </h2>
            <p
              id="quantum-overlay-description"
              className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/45 mt-1 font-mono"
            >
              {subtitle}
            </p>
          </motion.div>

          <motion.div
            className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-50 font-mono"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <span className="text-[10px] md:text-xs text-white/30 tracking-widest uppercase">
              {skills.length} Technologies · {ORBIT_CONFIG.length} Orbits
            </span>
          </motion.div>

          <motion.button
            onClick={onClose}
            className="absolute top-5 right-5 md:top-8 md:right-8 z-50 p-2.5 md:p-3 rounded-full bg-white/8 border border-white/20 text-white hover:bg-white/18 hover:border-white/40 transition-all focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black/50"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            aria-label={closeLabel}
          >
            <X size={18} className="md:w-5 md:h-5" />
          </motion.button>

          <div
            className="absolute inset-0 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence>
              {ORBIT_CONFIG.map((cfg, i) => (
                <OrbitRing
                  key={`ring-${i}`}
                  radius={isMobile ? cfg.radiusMobile : cfg.radiusDesktop}
                  orbitIndex={i}
                  isHovered={hoveredOrbit === i}
                />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {ORBIT_CONFIG.map((cfg, i) => (
                <OrbitLayer
                  key={`orbit-${i}`}
                  skills={orbitSkills[i]}
                  radius={isMobile ? cfg.radiusMobile : cfg.radiusDesktop}
                  orbitIndex={i}
                  direction={cfg.direction as 1 | -1}
                  duration={cfg.duration}
                />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              <CentralHub key="hub" title={title} logo={logo} />
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}