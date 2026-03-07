"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ProjectModal } from "./project-modal";

interface ProjectCardProps {
  title: string;
  description: string;
  technologies: string[];
  href: string;
  thumbnail: string;
  gallery: string[];
  logo: string;
}

const BLINK = `@keyframes blink-caret{0%,100%{opacity:1}50%{opacity:0}}`;

function useTypingEffect(text: string, active: boolean, speed = 52): string {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) { setOut(""); return; }
    let i = 0; setOut("");
    const id = setInterval(() => { i++; setOut(text.slice(0, i)); if (i >= text.length) clearInterval(id); }, speed);
    return () => clearInterval(id);
  }, [active, text, speed]);
  return out;
}

export function ProjectCard(props: ProjectCardProps) {
  const { title, description, technologies, thumbnail, logo } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [isHov,  setIsHov]  = useState(false);
  const typed = useTypingEffect("conhecer projeto", isHov && !isOpen);
  const rafRef = useRef<number | null>(null);

  const rx = useMotionValue(0), ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 110, damping: 14 });
  const sy = useSpring(ry, { stiffness: 110, damping: 14 });

  // Throttle mousemove com requestAnimationFrame para performance
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) return;
    
    // Captura valores antes do requestAnimationFrame (evento será reciclado)
    const target = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    rafRef.current = requestAnimationFrame(() => {
      const r = target.getBoundingClientRect();
      rx.set(((clientX - r.left - r.width / 2) / (r.width / 2)) * 6);
      ry.set(((clientY - r.top - r.height / 2) / (r.height / 2)) * -6);
      rafRef.current = null;
    });
  }, [rx, ry]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    rx.set(0);
    ry.set(0);
  }, [rx, ry]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: BLINK }} />
      <div className="group block h-full cursor-pointer select-none"
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHov(true)}
        onMouseLeave={() => setIsHov(false)}
      >
        <motion.div
          className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white/60 shadow-lg hover:shadow-xl transition-shadow will-change-transform"
          style={{ rotateX: sy, rotateY: sx, transformStyle: "preserve-3d", transform: "translate3d(0,0,0)" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative h-[240px] w-full flex-shrink-0 overflow-hidden bg-neutral-100 sm:h-[280px]">
            <Image src={thumbnail} alt={title} fill sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover object-top transition-transform duration-500 will-change-transform group-hover:scale-105"
              priority={false}
            />
            <AnimatePresence>
              {isHov && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ 
                    background: "rgba(4,4,8,0.50)", 
                    willChange: "opacity",
                    transform: "translate3d(0,0,0)"
                  }}>
                  <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-white drop-shadow-lg">
                    {typed}<span className="ml-[2px] inline-block" style={{ animation: "blink-caret 0.55s step-end infinite" }}>|</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-8 sm:py-10">
            <div className="space-y-3 relative">
              <div className="flex items-center justify-center min-h-[4rem]">
                <Image src={logo} alt={title} width={240} height={80} className="h-16 w-auto object-contain" priority />
              </div>
              <motion.div 
                className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-neutral-50 will-change-transform"
                animate={isHov ? { background: "#0a0a0a", color: "#fff", borderColor: "#0a0a0a" } : {}}
                transition={{ duration: 0.15 }}>
                <ArrowUpRight size={18} />
              </motion.div>
              <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {technologies.map((t) => (
                <span key={t} className="rounded-full border border-black/8 bg-white px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{t}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <ProjectModal {...props} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}