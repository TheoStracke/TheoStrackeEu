"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring, type Variants } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";

export interface ProjectModalProps {
  title: string;
  description?: string;
  technologies: string[];
  href: string;
  gallery: string[];
  logo: string;
  isOpen: boolean;
  onClose: () => void;
}

const EXPO = [0.16, 1, 0.3, 1] as const;
const CIRC = [0.55, 0, 1, 0.45] as const;

const backdropV: Variants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(12px)", transition: { duration: 0.5, ease: EXPO } },
  exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.4, ease: CIRC } },
};

const panelV: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 30, rotateX: 5 },
  visible: { opacity: 1, scale: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: EXPO } },
  exit: { opacity: 0, scale: 0.95, y: 15, rotateX: 2, transition: { duration: 0.4, ease: CIRC } },
};

const slideV: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? 30 : -30 }),
  center: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1] // Ease-out suave
    } 
  },
  exit: (d: number) => ({ 
    opacity: 0, 
    x: d > 0 ? -30 : 30,
    transition: { 
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1]
    } 
  }),
};

function useModalKeys(onClose: () => void, onPrev: () => void, onNext: () => void) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, onPrev, onNext]);
}

function useSwipe(onNext: () => void, onPrev: () => void) {
  const x0 = useRef<number | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => { x0.current = e.clientX; },
    onPointerUp: (e: React.PointerEvent) => {
      if (x0.current === null) return;
      const d = e.clientX - x0.current;
      if (Math.abs(d) > 44) d < 0 ? onNext() : onPrev();
      x0.current = null;
    },
  };
}

const BW = 56, BH = 140;
const LEFT_PATH = `M ${BW},0 C ${BW * 0.5},0 0,${BH * 0.2} 0,${BH / 2} C 0,${BH * 0.8} ${BW * 0.5},${BH} ${BW},${BH} Z`;
const RIGHT_PATH = `M 0,0 C ${BW * 0.5},0 ${BW},${BH * 0.2} ${BW},${BH / 2} C ${BW},${BH * 0.8} ${BW * 0.5},${BH} 0,${BH} Z`;

// LIQUID GLASS CORE STYLES
const GLASS_BG = "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%)";
const GLASS_BLUR = "blur(48px) saturate(200%)";
const HIGHLIGHT_TOP = "inset 0px 1px 1px rgba(255, 255, 255, 0.8)";
const HIGHLIGHT_BOTTOM = "inset 0px -1px 1px rgba(255, 255, 255, 0.15)";
const SHADOW_DEEP = "0 32px 64px -16px rgba(0, 0, 0, 0.3), 0 16px 32px -8px rgba(0, 0, 0, 0.2)";

function Blob({ dir, onClick, disabled }: { dir: "left" | "right"; onClick: () => void; disabled: boolean }) {
  const [hov, setHov] = useState(false);
  const isLeft = dir === "left";
  const path = isLeft ? LEFT_PATH : RIGHT_PATH;
  const raw = useMotionValue(1);
  const scale = useSpring(raw, { stiffness: 400, damping: 25 });

  const innerShadow = isLeft 
    ? `inset 1px 1px 1px rgba(255,255,255,0.7), inset 0 -1px 1px rgba(255,255,255,0.15)`
    : `inset -1px 1px 1px rgba(255,255,255,0.7), inset 0 -1px 1px rgba(255,255,255,0.15)`;

  return (
    <AnimatePresence>
      {!disabled && (
        <motion.button
          key={dir} onClick={onClick}
          onMouseEnter={() => { setHov(true); raw.set(1.08); }}
          onMouseLeave={() => { setHov(false); raw.set(1); }}
          initial={{ opacity: 0, x: isLeft ? -12 : 12 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: EXPO, delay: 0.1 } }}
          exit={{ opacity: 0, x: isLeft ? -8 : 8, transition: { duration: 0.2 } }}
          className="focus:outline-none z-0 relative group will-change-transform"
          style={{
            scale, width: BW, height: BH, flexShrink: 0,
            clipPath: `path('${path}')`,
            background: GLASS_BG,
            backdropFilter: GLASS_BLUR,
            WebkitBackdropFilter: GLASS_BLUR,
            transform: "translate3d(0,0,0)"
          }}
        >
          {/* Edge Refraction & Shadow Integration */}
          <div 
            className="pointer-events-none absolute inset-0 transition-opacity duration-300 group-hover:opacity-100 opacity-80"
            style={{ 
              clipPath: `path('${path}')`, 
              boxShadow: innerShadow,
              background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)"
            }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center mix-blend-overlay"
            animate={{ x: hov ? (isLeft ? -4 : 4) : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ marginLeft: isLeft ? -10 : 10 }}
          >
            {isLeft ? <ChevronLeft size={24} className="text-white drop-shadow-md" /> : <ChevronRight size={24} className="text-white drop-shadow-md" />}
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function ModalCore({ title, description, technologies, href, gallery, logo, onClose }: Omit<ProjectModalProps, "isOpen">) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const isTransitioning = useRef(false);

  const goTo = useCallback((n: number) => {
    if (isTransitioning.current || n === idx || n < 0 || n >= gallery.length) return;
    isTransitioning.current = true;
    setDir(n > idx ? 1 : -1);
    setIdx(n);
    // Reset após a duração da transição (250ms + buffer)
    setTimeout(() => { isTransitioning.current = false; }, 300);
  }, [idx, gallery.length]);

  useModalKeys(onClose, () => goTo(idx - 1), () => goTo(idx + 1));
  const swipe = useSwipe(() => goTo(idx + 1), () => goTo(idx - 1));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 perspective-1000">
      
      {/* ── LAYER 1: CINEMATIC BACKDROP ── */}
      <motion.div
        className="absolute inset-0 bg-neutral-950/60"
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.6) 100%)"
        }}
        variants={backdropV} initial="hidden" animate="visible" exit="exit"
        onClick={onClose}
      />

      <motion.div
        className="relative z-10 flex items-center justify-center w-full max-w-6xl h-full max-h-[85vh] group/modal"
        variants={panelV} initial="hidden" animate="visible" exit="exit"
      >
        {/* LEFT BLOB */}
        <div className="hidden md:flex items-center -mr-[4px] z-0">
          <Blob dir="left" onClick={() => goTo(idx - 1)} disabled={idx === 0} />
        </div>

        {/* ── LAYER 2-6: MAIN LIQUID GLASS PANEL ── */}
        <div
          className="relative flex flex-col w-full h-full overflow-hidden rounded-[2.5rem] z-10 transition-all duration-500 ease-out"
          style={{
            background: GLASS_BG,
            backdropFilter: GLASS_BLUR,
            WebkitBackdropFilter: GLASS_BLUR,
            boxShadow: `${HIGHLIGHT_TOP}, ${HIGHLIGHT_BOTTOM}, inset 1px 0 1px rgba(255,255,255,0.3), inset -1px 0 1px rgba(255,255,255,0.3), ${SHADOW_DEEP}`,
          }}
        >
          {/* Layer 3 & 4: Light Sweep & Dynamic Glare (Microinteraction) */}
          <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-40 transition-opacity duration-500 group-hover/modal:opacity-70 z-20 mix-blend-overlay" />
          <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent z-50 opacity-70" />

          {/* HEADER */}
          <div className="relative z-30 flex-shrink-0 flex items-start justify-between p-6 sm:p-8 pb-4">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-center">
                <Image src={logo} alt={title} width={350} height={100} className="h-20 w-auto object-contain drop-shadow-lg" priority />
              </div>
              {description && <p className="text-sm sm:text-base text-white/80 text-center font-medium leading-relaxed">{description}</p>}
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* ── RECESSED IMAGE CONTAINER ── */}
          <div className="relative z-30 flex-1 min-h-0 w-full px-6 sm:px-8 pb-6" {...swipe}>
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
                {/* Layer 5: Inner shadow recess for the image */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/20 shadow-[inset_0_4px_24px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-md">
                  <Image
                    src={gallery[idx]}
                    alt={`Screenshot ${idx + 1}`}
                    fill
                    className="object-contain drop-shadow-2xl p-2"
                    quality={100}
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                  {/* Subtle inner reflection on the recessed glass */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* FOOTER */}
          <div className="relative z-30 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 border-t border-white/20 bg-white/5 gap-4 backdrop-blur-lg">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {technologies.map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white bg-white/10 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex gap-2 bg-black/20 px-3 py-2 rounded-full border border-white/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)]">
                {gallery.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => goTo(i)} 
                    className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "w-2 bg-white/30 hover:bg-white/50"}`} 
                  />
                ))}
              </div>
              <a 
                href={href} 
                target="_blank" 
                rel="noreferrer" 
                className="group flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-[0_4px_14px_rgba(255,255,255,0.25)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300"
              >
                Visitar <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

        </div>

        {/* RIGHT BLOB */}
        <div className="hidden md:flex items-center -ml-[4px] z-0">
          <Blob dir="right" onClick={() => goTo(idx + 1)} disabled={idx === gallery.length - 1} />
        </div>

      </motion.div>
    </div>
  );
}

export function ProjectModal({ isOpen, ...rest }: ProjectModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Bloqueia scroll da página quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      
      // Estratégia combinada: overflow + position fixed
      htmlElement.style.overflow = "hidden";
      bodyElement.style.position = "fixed";
      bodyElement.style.top = `-${scrollY}px`;
      bodyElement.style.width = "100%";
      bodyElement.style.overflow = "hidden";
      bodyElement.style.paddingRight = `${scrollbarWidth}px`;
      
      // Desabilita Lenis se existir
      const lenisInstance = (window as any).lenis;
      if (lenisInstance?.stop) {
        lenisInstance.stop();
      }
      
      // PREVINE eventos na fase de CAPTURA (antes de outros listeners)
      const handleScroll = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
      
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
          e.preventDefault();
        }
      };
      
      // Usa CAPTURE PHASE + passive: false para pegar antes de qualquer outro listener
      document.addEventListener('wheel', handleScroll, { capture: true, passive: false });
      document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
      document.addEventListener('keydown', handleKeyDown, { capture: true });
      
      return () => {
        document.removeEventListener('wheel', handleScroll, true);
        document.removeEventListener('touchmove', handleTouchMove, true);
        document.removeEventListener('keydown', handleKeyDown, true);
        
        // Reativa Lenis
        if (lenisInstance?.start) {
          lenisInstance.start();
        }
        
        // Restaura estilos E posição do scroll
        htmlElement.style.overflow = "";
        bodyElement.style.position = "";
        bodyElement.style.top = "";
        bodyElement.style.width = "";
        bodyElement.style.overflow = "";
        bodyElement.style.paddingRight = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
  
  if (!mounted || typeof document === "undefined") return null;
  
  return createPortal(
    <AnimatePresence>{isOpen && <ModalCore {...rest} />}</AnimatePresence>,
    document.body
  );
}