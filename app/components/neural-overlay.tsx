"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { stopScroll, startScroll } from "../components/lenis-provider";

interface NeuralOverlayProps {
  skills: string[];
  title: string;
  logo?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Convert polar coordinates to cartesian
function polarToCartesian(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: radius * Math.cos(radians),
    y: radius * Math.sin(radians),
  };
}

interface SkillNodeProps {
  skill: string;
  x: number;
  y: number;
  index: number;
}

function SkillNode({ skill, x, y, index }: SkillNodeProps) {
  const duration = 5 + Math.random() * 2;
  const dx = (Math.random() * 20 - 10) * 0.6;
  const dy = (Math.random() * 20 - 10) * 0.6;

  return (
    <motion.div
      className="absolute"
      style={{ left: "50%", top: "50%", x, y, translateX: "-50%", translateY: "-50%" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 12,
      }}
    >
      <motion.div
        animate={{ x: [0, dx, -dx, 0], y: [0, -dy, dy, 0] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="group cursor-default"
      >
        <div className="relative rounded-full bg-white/5 backdrop-blur-lg border border-white/15 px-6 py-3 text-white/90 text-xs md:text-sm font-light tracking-widest whitespace-nowrap shadow-lg transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:scale-105">
          {skill}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 rounded-full border border-white/30 blur-sm" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RadialLine({ angle, radius }: { angle: number; radius: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ rotate: `${angle}deg` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="h-[1px] w-[var(--line-radius)] bg-gradient-to-r from-white/30 to-transparent"
        style={{
          // Tailwind can't use dynamic values directly; pass via CSS var
          // @ts-ignore
          "--line-radius": `${radius}px`,
        }}
      />
    </motion.div>
  );
}

export function NeuralOverlay({ skills, title, logo, isOpen, onClose }: NeuralOverlayProps) {
  const total = skills.length || 1;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const radius = isMobile ? 140 : 300;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      stopScroll();
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${currentScrollY}px`;
      document.documentElement.setAttribute("data-neural-overlay-open", "true");
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
      startScroll();
      document.documentElement.removeAttribute("data-neural-overlay-open");
    }
  }, [isOpen]);

  const step = 360 / total;

  const SkillSpoke = ({ label, index }: { label: string; index: number }) => {
    const rotation = index * step;
    const drift = 5; // px along axis
    const baseScale = (radius - drift) / radius;
    const maxScale = (radius + drift) / radius;

    return (
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
      >
        {/* Beam line perfectly attached to node - using SVG for dashed effect */}
        <svg
          className="absolute left-0 top-1/2 -translate-y-1/2 origin-left overflow-visible"
          width={radius}
          height="2"
          style={{ width: radius }}
        >
          <motion.line
            x1="0"
            y1="1"
            x2={radius}
            y2="1"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="30 20"
            animate={{ strokeDashoffset: [0, -50, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>

        {/* Node at the end of the spoke with counter-rotation */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2"
          initial={{ x: radius - drift }}
          animate={{ x: [radius - drift, radius + drift, radius - drift] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ transform: `rotate(${-rotation}deg)` }} className="pointer-events-auto">
            <div className="rounded-lg px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/30 text-white font-bold tracking-wider text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {label}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Atmosphere */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-black/60 to-black" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[length:16px_16px] opacity-5 mix-blend-soft-light" />
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 40%)`,
                }}
              />
            </div>

            {/* Center Hub */}
            <motion.div
              className="relative z-50 w-32 h-32 md:w-40 md:h-40 rounded-full bg-white backdrop-blur-2xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center justify-center"
              animate={{ scale: [1, 1.03, 1], y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {logo ? (
                <img src={logo} alt={title} className="w-3/4 h-3/4 object-contain" />
              ) : (
                <p className="text-white/90 font-display text-base md:text-lg font-bold">{title}</p>
              )}
            </motion.div>

            {/* Spokes and Nodes */}
            <div className="absolute inset-0">
              {skills.map((skill, i) => (
                <SkillSpoke key={skill} label={skill} index={i} />
              ))}
            </div>

            {/* Header Info */}
            <motion.div
              className="absolute top-12 left-12 z-50 text-center md:text-left"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-4xl font-display text-white mb-1">{title}</h2>
              <p className="text-xs uppercase tracking-widest text-white/60">Habilidades & Tecnologias</p>
            </motion.div>

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Close"
            >
              <X size={24} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
