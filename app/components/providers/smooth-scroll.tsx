"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, usePrefersReducedMotion } from "@/lib/media";
import { stage } from "@/lib/stage/store";

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Scroll suave (Lenis) dirigido pelo ticker do GSAP: um único rAF move
 * scroll, ScrollTrigger e tweens em lockstep. Com reduced-motion, scroll nativo.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (reduced) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [reduced]);

  useLenis((lenis) => {
    ScrollTrigger.update();
    stage.velocity = lenis.velocity;
  });

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ autoRaf: false, lerp: 0.085, wheelMultiplier: 0.95, anchors: true, stopInertiaOnNavigate: true }}
    >
      {children}
    </ReactLenis>
  );
}

/** Navegação suave para âncoras/posições, com fallback nativo. */
export function useScrollTo() {
  const lenis = useLenis();
  return useCallback(
    (target: string | number, options: { immediate?: boolean; duration?: number } = {}) => {
      if (lenis) {
        // saltos imediatos valem mesmo com o scroll travado (ex.: âncora durante o loader)
        lenis.scrollTo(target, {
          duration: options.duration ?? 1.8,
          easing: easeOutExpo,
          immediate: options.immediate,
          force: options.immediate,
        });
        return;
      }
      const behavior = options.immediate || prefersReducedMotion() ? "auto" : "smooth";
      if (typeof target === "number") window.scrollTo({ top: target, behavior });
      else document.querySelector(target)?.scrollIntoView({ behavior });
    },
    [lenis],
  );
}

/** Trava o scroll (loader, menu) — Lenis quando ativo, overflow nativo caso contrário. */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!locked) return;
    if (lenis) {
      lenis.stop();
      return () => lenis.start();
    }
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [locked, lenis]);
}
