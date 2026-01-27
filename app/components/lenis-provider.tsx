"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function stopScroll() {
  if (lenisInstance) lenisInstance.stop();
}

export function startScroll() {
  if (lenisInstance) lenisInstance.start();
}

export function scrollTo(target: string | number) {
  if (lenisInstance) lenisInstance.scrollTo(target, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 3) });
}

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      lerp: 0.08,
      easing: (t) => 1 - Math.pow(1 - t, 1.6),
    });

    lenisInstance = lenis;

    let animationFrame: number;

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(raf);
    };

    animationFrame = requestAnimationFrame(raf);

    // Handle anchor link clicks
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          lenis.scrollTo(href, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 3) });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
