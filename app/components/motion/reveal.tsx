"use client";

import clsx from "clsx";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/media";

// ═══════════════════════════════════════════════════════════════════════════
// Primitivos de transição. Regras comuns:
//   · reversíveis: entram ao descer e saem ao voltar (toggleActions reverse)
//   · `data-reveal` esconde o elemento só quando há JS (sem flash, sem SEO ruim)
//   · prefers-reduced-motion → conteúdo estático, imediatamente visível
// ═══════════════════════════════════════════════════════════════════════════

const TOGGLE = "play none none reverse";

interface ScrollPlayback {
  /** "scroll" (padrão) ou controlado por `active` */
  mode?: "scroll" | "manual";
  /** em modo manual: quando vira true, a animação toca */
  active?: boolean;
  start?: string;
  delay?: number;
}

// ── SEÇÃO: SplitReveal — tipografia por linha/palavra/letra com máscara ──

type SplitType = "lines" | "words" | "chars";

interface SplitRevealProps extends ScrollPlayback {
  as?: ElementType;
  children: string;
  className?: string;
  type?: SplitType;
  stagger?: number;
}

export function SplitReveal({
  as: Tag = "p",
  children,
  className,
  type = "lines",
  stagger,
  mode = "scroll",
  active = true,
  start = "top 88%",
  delay = 0,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      if (mode === "manual" && !active) return;

      const split = SplitText.create(el, {
        type: type === "chars" ? "words,chars" : type,
        mask: type,
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { autoAlpha: 1 });
          // folga para descendentes (g, p, ç) com line-height apertado — sem mudar o layout
          gsap.set(self.masks, { paddingBottom: "0.14em", marginBottom: "-0.14em" });
          return gsap.from(self[type], {
            yPercent: 130,
            rotate: type === "chars" ? 6 : 0,
            duration: type === "chars" ? 1.3 : 1.15,
            stagger: stagger ?? (type === "chars" ? 0.028 : type === "words" ? 0.04 : 0.09),
            delay,
            scrollTrigger: mode === "scroll" ? { trigger: el, start, toggleActions: TOGGLE } : undefined,
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [reduced, children, type, mode, active, start, delay], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} className={className} data-reveal="">
      {children}
    </Tag>
  );
}

// ── SEÇÃO: MaskReveal — cortina por clip-path com contra-escala do conteúdo ──

type Direction = "up" | "down" | "left" | "right";

const CLIP_FROM: Record<Direction, string> = {
  up: "inset(100% 0% 0% 0%)",
  down: "inset(0% 0% 100% 0%)",
  left: "inset(0% 0% 0% 100%)",
  right: "inset(0% 100% 0% 0%)",
};

interface MaskRevealProps extends ScrollPlayback {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  /** liga a revelação diretamente ao scroll em vez de tocar/reverter */
  scrub?: boolean;
}

export function MaskReveal({
  children,
  className,
  direction = "up",
  scrub = false,
  mode = "scroll",
  active = true,
  start = "top 85%",
  delay = 0,
}: MaskRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      // fechado até ser ativado (o CSS de data-reveal cuida do pré-JS)
      gsap.set(el, { autoAlpha: 1, clipPath: CLIP_FROM[direction] });
      if (mode === "manual" && !active) return;

      const inner = el.firstElementChild;
      const scrollTrigger =
        mode === "scroll"
          ? scrub
            ? { trigger: el, start, end: "top 35%", scrub: 0.8 }
            : { trigger: el, start, toggleActions: TOGGLE }
          : undefined;

      const tl = gsap.timeline({ delay, scrollTrigger });
      tl.fromTo(
        el,
        { clipPath: CLIP_FROM[direction] },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" },
      );
      if (inner) tl.from(inner, { scale: 1.25, duration: 1.8, ease: "expo.out" }, 0);
    },
    { scope: ref, dependencies: [reduced, direction, scrub, mode, active, start, delay], revertOnUpdate: true },
  );

  return (
    <div ref={ref} className={clsx("overflow-hidden", className)} data-reveal="">
      {children}
    </div>
  );
}

// ── SEÇÃO: FadeReveal — subida curta para blocos e grupos (stagger) ──

interface FadeRevealProps extends ScrollPlayback {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** anima os filhos diretos em sequência */
  stagger?: number;
  y?: number;
}

export function FadeReveal({
  children,
  className,
  as: Tag = "div",
  stagger = 0,
  y = 36,
  mode = "scroll",
  active = true,
  start = "top 88%",
  delay = 0,
}: FadeRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || (mode === "manual" && !active && !reduced)) return;
      gsap.set(el, { autoAlpha: 1 });
      if (reduced) return;

      const targets = stagger > 0 ? Array.from(el.children) : el;
      gsap.from(targets, {
        y,
        autoAlpha: 0,
        duration: 1.2,
        stagger,
        delay,
        scrollTrigger: mode === "scroll" ? { trigger: el, start, toggleActions: TOGGLE } : undefined,
      });
    },
    { scope: ref, dependencies: [reduced, stagger, y, mode, active, start, delay], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
