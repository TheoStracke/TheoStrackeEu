"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../../lib/gsap";

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ScrollToOptions {
  offset?: number;
  duration?: number;
  easing?: (t: number) => number;
  immediate?: boolean;
  lock?: boolean;
  onComplete?: () => void;
}

export interface ScrollData {
  scroll: number;
  limit: number;
  velocity: number;
  direction: 1 | -1;
  progress: number;
}

type ScrollCallback = (data: ScrollData) => void;

// ═══════════════════════════════════════════════════════════════════════════
// Singleton Instance & State
// ═══════════════════════════════════════════════════════════════════════════

let lenisInstance: Lenis | null = null;
let scrollListeners: Set<ScrollCallback> = new Set();
let isEnabled = true;
const chapterScrollLocks = new Set<string>();

// ═══════════════════════════════════════════════════════════════════════════
// Easing Functions (Production-Ready Curves)
// ═══════════════════════════════════════════════════════════════════════════

export const easings = {
  // Smooth deceleration (default for scrollTo)
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  
  // Sharp start, smooth end (for hero sections)
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  
  // Very smooth (for global wheel scroll)
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  
  // Subtle ease (for short distances)
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

// ═══════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pause smooth scrolling (useful for modals, overlays, menus)
 */
export function stopScroll(): void {
  if (lenisInstance && isEnabled) {
    lenisInstance.stop();
  }
}

/**
 * Resume smooth scrolling
 */
export function startScroll(): void {
  if (lenisInstance && isEnabled && chapterScrollLocks.size === 0) {
    lenisInstance.start();
  }
}

/**
 * Pause smooth scrolling for an interactive chapter segment.
 * Multiple chapters can request a pause; scroll resumes only when all locks are released.
 */
export function pauseForChapter(id: string): void {
  if (!id) return;

  chapterScrollLocks.add(id);

  if (lenisInstance && isEnabled) {
    lenisInstance.stop();
  }
}

/**
 * Release a chapter pause lock and resume smooth scrolling when no locks remain.
 */
export function resumeFromChapter(id: string): void {
  if (!id) return;

  chapterScrollLocks.delete(id);

  if (lenisInstance && isEnabled && chapterScrollLocks.size === 0) {
    lenisInstance.start();
  }
}

/**
 * Smoothly scroll to target element, selector, or position
 * @example
 * scrollTo("#projects");
 * scrollTo(document.querySelector("#about"));
 * scrollTo(1200, { duration: 2, offset: -80 });
 */
export function scrollTo(
  target: string | number | HTMLElement,
  options: ScrollToOptions = {}
): void {
  if (!lenisInstance || !isEnabled) {
    // Fallback to native scroll if Lenis disabled
    if (typeof target === "string") {
      const element = document.querySelector(target);
      element?.scrollIntoView({ behavior: "smooth" });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    } else {
      target?.scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  const {
    offset = -80, // Scroll slightly before top (header offset)
    duration = 1.5,
    easing = easings.easeOutCubic,
    immediate = false,
    lock = false,
    onComplete,
  } = options;

  // Verify element exists before scrolling
  if (typeof target === "string") {
    const element = document.querySelector(target);
    if (!element) {
      console.warn(`[Lenis] Element not found: ${target}`);
      return;
    }
  }

  lenisInstance.scrollTo(target, {
    offset,
    duration: immediate ? 0 : duration,
    easing,
    lock,
    onComplete,
  });
}

/**
 * Get current scroll position
 */
export function getScroll(): number {
  return lenisInstance?.scroll ?? window.scrollY;
}

/**
 * Get scroll progress (0 to 1)
 */
export function getScrollProgress(): number {
  if (!lenisInstance) return 0;
  return lenisInstance.progress ?? 0;
}

/**
 * Subscribe to scroll events (for parallax, progress bars, animations)
 * Returns unsubscribe function
 * @example
 * const unsubscribe = onScroll(({ scroll, progress, velocity }) => {
 *   console.log("Scrolled to:", scroll, "Progress:", progress);
 * });
 * // Later: unsubscribe();
 */
export function onScroll(callback: ScrollCallback): () => void {
  scrollListeners.add(callback);
  return () => scrollListeners.delete(callback);
}

/**
 * Check if smooth scroll is currently enabled
 */
export function isScrollEnabled(): boolean {
  return isEnabled && lenisInstance !== null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Provider Component
// ═══════════════════════════════════════════════════════════════════════════

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Disable smooth scroll on mobile/tablet for performance
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      isEnabled = false;
      return;
    }

    // Initialize Lenis with production-ready config
    const lenis = new Lenis({
      duration: 1.2,
      easing: easings.easeOutExpo,
      smoothWheel: true,
      lerp: 0.08, // Smooth interpolation (lower = smoother but slower)
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
      infinite: false,
      autoResize: true,
    });

    lenisInstance = lenis;
    isEnabled = true;

    if (chapterScrollLocks.size > 0) {
      lenis.stop();
    }

    // Sync Lenis with GSAP so ScrollTrigger and smooth scroll stay in lockstep.
    const lenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);

    // Broadcast scroll events to all listeners (for parallax, progress, etc.)
    lenis.on("scroll", (data: any) => {
      const scrollData: ScrollData = {
        scroll: data.scroll,
        limit: data.limit,
        velocity: data.velocity,
        direction: data.direction,
        progress: data.progress,
      };

      // Notify all subscribers without causing re-renders
      scrollListeners.forEach((callback) => {
        try {
          callback(scrollData);
        } catch (error) {
          console.error("[Lenis] Scroll callback error:", error);
        }
      });
    });

    // Intercept anchor links and scroll smoothly
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement;
      
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      // Verify target element exists
      const element = document.querySelector(href);
      if (!element) {
        console.warn(`[Lenis] Anchor target not found: ${href}`);
        return;
      }

      e.preventDefault();
      scrollTo(href, { duration: 1.5, offset: -80 });
    };

    document.addEventListener("click", handleAnchorClick, { passive: false });

    // Cleanup: prevent memory leaks
    return () => {
      document.removeEventListener("click", handleAnchorClick);
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(lenisTicker);
      scrollListeners.clear();
      lenis.destroy();
      lenisInstance = null;
      isEnabled = false;
      chapterScrollLocks.clear();
    };
  }, []);

  return <>{children}</>;
}
