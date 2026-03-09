"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  radius?: { mobile: number; desktop: number };
  driftAmount?: number; // Floating drift distance in pixels
  animationDuration?: number; // Base duration for floating animations
  lineStyle?: "solid" | "dashed" | "gradient";
  showMouseGlow?: boolean;
}

interface SkillNodePosition {
  angle: number;
  x: number;
  y: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// Animation Variants
// ═══════════════════════════════════════════════════════════════════════════

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.6, 1] }
  },
};

const hubVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 0.1,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

function calculateNodePositions(count: number, radius: number): SkillNodePosition[] {
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    const angle = i * step;
    const radians = (angle * Math.PI) / 180;
    return {
      angle,
      x: radius * Math.cos(radians),
      y: radius * Math.sin(radians),
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Skill Node Component
// ═══════════════════════════════════════════════════════════════════════════

interface SkillNodeProps {
  skill: string;
  position: SkillNodePosition;
  index: number;
  driftAmount: number;
  animationDuration: number;
  radius: number;
}

function SkillNode({ skill, position, index, driftAmount, animationDuration, radius }: SkillNodeProps) {
  // Random but consistent drift pattern per node
  const driftX = useMemo(() => (Math.sin(index * 2.5) * driftAmount), [index, driftAmount]);
  const driftY = useMemo(() => (Math.cos(index * 3.2) * driftAmount), [index, driftAmount]);
  const duration = useMemo(() => animationDuration + (index % 3) * 0.5, [animationDuration, index]);

  // Calculate position along spoke with drift
  const baseDistance = radius - driftAmount;
  const maxDistance = radius + driftAmount;

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ transform: `translate(-50%, -50%) rotate(${position.angle}deg)` }}
    >
      {/* Animated node with counter-rotation */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2"
        initial={{ x: baseDistance, opacity: 0, scale: 0.5 }}
        animate={{ 
          x: [baseDistance, maxDistance, baseDistance],
          opacity: 1,
          scale: 1,
        }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{
          x: {
            duration,
            repeat: Infinity,
            ease: "easeInOut",
          },
          opacity: { duration: 0.4, delay: index * 0.05 },
          scale: { 
            duration: 0.5, 
            delay: index * 0.05,
            type: "spring",
            stiffness: 150,
            damping: 15,
          },
        }}
      >
        {/* Counter-rotate to keep text horizontal */}
        <div 
          className="pointer-events-auto"
          style={{ transform: `rotate(${-position.angle}deg)` }}
        >
          <motion.div
            className="group relative cursor-default"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="relative rounded-lg px-4 py-2.5 md:px-6 md:py-3 bg-black/60 backdrop-blur-xl border border-white/30 text-white font-medium tracking-wider text-xs md:text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 group-hover:bg-black/70 group-hover:border-white/50 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              {skill}
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent blur-sm" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Animated Spoke Line Component
// ═══════════════════════════════════════════════════════════════════════════

interface AnimatedSpokeProps {
  angle: number;
  radius: number;
  index: number;
  lineStyle: "solid" | "dashed" | "gradient";
}

function AnimatedSpoke({ angle, radius, index, lineStyle }: AnimatedSpokeProps) {
  const strokeDasharray = lineStyle === "dashed" ? "30 20" : undefined;
  
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 origin-left"
      style={{ rotate: `${angle}deg` }}
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      exit={{ opacity: 0, scaleX: 0 }}
      transition={{
        opacity: { duration: 0.4, delay: index * 0.03 },
        scaleX: { 
          duration: 0.6, 
          delay: index * 0.03,
          ease: [0.2, 0.8, 0.2, 1],
        },
      }}
    >
      <svg
        className="absolute left-0 top-1/2 -translate-y-1/2 origin-left overflow-visible"
        width={radius}
        height="2"
        style={{ width: radius }}
      >
        {lineStyle === "gradient" ? (
          <>
            <defs>
              <linearGradient id={`spoke-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>
            </defs>
            <motion.line
              x1="0"
              y1="1"
              x2={radius}
              y2="1"
              stroke={`url(#spoke-gradient-${index})`}
              strokeWidth="2"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        ) : (
          <motion.line
            x1="0"
            y1="1"
            x2={radius}
            y2="1"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
            animate={{ 
              strokeDashoffset: strokeDasharray ? [0, -50, 0] : undefined,
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        )}
      </svg>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Neural Overlay Component
// ═══════════════════════════════════════════════════════════════════════════

export function NeuralOverlay({
  skills,
  title,
  logo,
  isOpen,
  onClose,
  subtitle = "Skills & Technologies",
  closeLabel = "Close",
  radius: radiusProp,
  driftAmount = 5,
  animationDuration = 6,
  lineStyle = "dashed",
  showMouseGlow = true,
}: NeuralOverlayProps) {
  // Responsive radius
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const radius = radiusProp 
    ? (isMobile ? radiusProp.mobile : radiusProp.desktop)
    : (isMobile ? 140 : 280);

  // Mouse position for glow effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Calculate node positions
  const nodePositions = useMemo(
    () => calculateNodePositions(skills.length, radius),
    [skills.length, radius]
  );

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (showMouseGlow) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [showMouseGlow]);

  // Keyboard handler (Escape key)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  // Mouse move effect
  useEffect(() => {
    if (!isOpen || !showMouseGlow) return;
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen, showMouseGlow, handleMouseMove]);

  // Keyboard listener
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Scroll lock and body position management
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
          key="neural-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="neural-overlay-title"
          aria-describedby="neural-overlay-description"
        >
          {/* Backdrop with blur and atmosphere */}
          <div className="absolute inset-0 backdrop-blur-xl bg-black/70">
            {/* Radial gradient atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-black/60 to-black" />
            
            {/* Subtle noise texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[length:16px_16px] opacity-5 mix-blend-soft-light" />
            
            {/* Mouse-follow glow */}
            {showMouseGlow && (
              <motion.div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 40%)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>

          {/* Main content container */}
          <div 
            className="absolute inset-0 flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Central Hub */}
            <motion.div
              className="relative z-50 w-28 h-28 md:w-36 md:h-36 rounded-full bg-white backdrop-blur-2xl border-2 border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.25)] flex items-center justify-center"
              variants={hubVariants}
              animate={{ 
                scale: [1, 1.03, 1],
                y: [0, -6, 0],
              }}
              transition={{
                scale: { duration: animationDuration, repeat: Infinity, ease: "easeInOut" },
                y: { duration: animationDuration, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              {logo ? (
                <img 
                  src={logo} 
                  alt={title} 
                  className="w-3/4 h-3/4 object-contain"
                />
              ) : (
                <p className="text-ink/90 font-display text-base md:text-xl font-bold text-center px-3">
                  {title}
                </p>
              )}
              
              {/* Hub inner glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />
            </motion.div>

            {/* Spokes & Nodes */}
            <div className="absolute inset-0">
              {/* Animated spokes */}
              {nodePositions.map((pos, i) => (
                <AnimatedSpoke
                  key={`spoke-${i}`}
                  angle={pos.angle}
                  radius={radius}
                  index={i}
                  lineStyle={lineStyle}
                />
              ))}

              {/* Skill nodes */}
              <AnimatePresence>
                {nodePositions.map((pos, i) => (
                  <SkillNode
                    key={skills[i]}
                    skill={skills[i]}
                    position={pos}
                    index={i}
                    driftAmount={driftAmount}
                    animationDuration={animationDuration}
                    radius={radius}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Header Info */}
            <motion.div
              className="absolute top-8 left-8 md:top-12 md:left-12 z-50 text-center md:text-left max-w-xs md:max-w-md"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <h2 
                id="neural-overlay-title"
                className="text-xl md:text-3xl lg:text-4xl font-display text-white mb-1 md:mb-2"
              >
                {title}
              </h2>
              <p 
                id="neural-overlay-description"
                className="text-xs md:text-sm uppercase tracking-widest text-white/60"
              >
                {subtitle}
              </p>
            </motion.div>

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-6 right-6 md:top-8 md:right-8 z-50 p-2.5 md:p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              aria-label={closeLabel}
            >
              <X size={20} className="md:w-6 md:h-6" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
