"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ProjectModal } from "./project-modal";

// ── Types ──
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

// ── Inline Hooks ──

/** Typing effect — types out text character by character when active. */
function useTypingEffect(text: string, active: boolean, speed = 48): string {
  const [output, setOutput] = useState("");
  useEffect(() => {
    if (!active) { setOutput(""); return; }
    let i = 0;
    setOutput("");
    const id = setInterval(() => {
      i++;
      setOutput(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [active, text, speed]);
  return output;
}

// ── Keyframes (injected once) ──
const BLINK_STYLE = `@keyframes blink-caret{0%,100%{opacity:1}50%{opacity:0}}`;

// ── Component ──

export function ProjectCard(props: ProjectCardProps) {
  const {
    title,
    description,
    technologies,
    thumbnail,
    logo,
    hoverCtaText = "view project",
    visitLabel = "Visit",
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const typed = useTypingEffect(hoverCtaText, isHovered && !isOpen);
  const rafRef = useRef<number | null>(null);

  // 3D tilt with spring physics
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 150, damping: 18, mass: 0.8 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 150, damping: 18, mass: 0.8 });

  // Throttled mousemove via rAF for performance
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (rafRef.current) return;
      const target = e.currentTarget;
      const clientX = e.clientX;
      const clientY = e.clientY;
      rafRef.current = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const xPct = (clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const yPct = (clientY - rect.top - rect.height / 2) / (rect.height / 2);
        rotateYRaw.set(xPct * 8);
        rotateXRaw.set(yPct * -8);
        rafRef.current = null;
      });
    },
    [rotateXRaw, rotateYRaw]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  }, [rotateXRaw, rotateYRaw]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: BLINK_STYLE }} />

      <div
        className="group block h-full cursor-pointer select-none"
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white/60 shadow-lg transition-shadow duration-500 will-change-transform hover:shadow-[0_0_60px_hsla(210,100%,60%,0.1)]"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            transform: "translate3d(0,0,0)",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* ── Thumbnail ── */}
          <div className="relative h-[240px] w-full flex-shrink-0 overflow-hidden bg-neutral-100 sm:h-[280px]">
            <Image
              src={thumbnail}
              alt={title}
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover object-top transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
              priority={false}
            />

            {/* Subtle radial glow on hover */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              animate={{ opacity: isHovered ? 0.6 : 0 }}
              transition={{ duration: 0.4 }}
              style={{
                background: "radial-gradient(ellipse at center, hsla(210, 100%, 70%, 0.15), transparent 70%)",
              }}
            />

            {/* Hover overlay with typing effect */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, rgba(4,4,8,0.3) 0%, rgba(4,4,8,0.7) 100%)",
                    willChange: "opacity",
                  }}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white drop-shadow-lg">
                    {typed}
                    <span
                      className="ml-0.5 inline-block"
                      style={{ animation: "blink-caret 0.6s step-end infinite" }}
                    >
                      |
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Card Body ── */}
          <div className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-8 sm:py-10">
            <div className="space-y-3 relative">
              {/* Logo with scale micro-interaction */}
              <div className="flex items-center justify-center min-h-[4rem]">
                <motion.div
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Image src={logo} alt={title} width={240} height={80} className="h-16 w-auto object-contain" priority />
                </motion.div>
              </div>

              {/* CTA Arrow with glow micro-interaction */}
              <motion.div
                className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-neutral-50"
                animate={
                  isHovered
                    ? { background: "#0a0a0a", color: "#fff", borderColor: "#0a0a0a", boxShadow: "0 0 20px hsla(210, 80%, 60%, 0.3)" }
                    : { background: "#fafafa", color: "#0a0a0a", borderColor: "rgba(0,0,0,0.05)", boxShadow: "none" }
                }
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  animate={isHovered ? { x: 2, y: -2 } : { x: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <ArrowUpRight size={18} />
                </motion.div>
              </motion.div>

              <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
            </div>

            {/* Technology badges with hover glow */}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="rounded-full border border-black/8 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition-all duration-300 group-hover:border-neutral-300 group-hover:shadow-[0_0_12px_hsla(210,80%,70%,0.15)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom border highlight on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px"
            animate={{
              background: isHovered
                ? "linear-gradient(90deg, transparent, hsla(210, 80%, 60%, 0.5), transparent)"
                : "linear-gradient(90deg, transparent, transparent, transparent)",
            }}
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
