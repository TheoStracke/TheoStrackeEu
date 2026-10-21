"use client";

import { useSyncExternalStore } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// Capacidades do dispositivo — fonte única para decidir entre a experiência
// 3D completa e o fallback estático (mobile, reduced-motion, sem WebGL2).
// ═══════════════════════════════════════════════════════════════════════════

export const MEDIA = {
  reducedMotion: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

// Cache por query: useSyncExternalStore re-assina se a função mudar a cada render
const subscribers = new Map<string, (onChange: () => void) => () => void>();

function subscribeMedia(query: string) {
  let subscribe = subscribers.get(query);
  if (!subscribe) {
    subscribe = (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    };
    subscribers.set(query, subscribe);
  }
  return subscribe;
}

/** Media query reativa e segura para SSR (no servidor assume `serverFallback`). */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(MEDIA.reducedMotion);
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(MEDIA.reducedMotion).matches;
}

// WebGL2 é testado uma única vez por sessão (criar contexto custa caro)
let webgl2Support: boolean | null = null;

export function supportsWebGL2(): boolean {
  if (webgl2Support !== null) return webgl2Support;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    webgl2Support = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2Support = false;
  }
  return webgl2Support;
}

const noopSubscribe = () => () => {};

/** Palco 3D só em desktop, com movimento liberado e WebGL2 disponível. */
export function isStageEnabled(): boolean {
  return window.matchMedia(MEDIA.desktop).matches && !prefersReducedMotion() && supportsWebGL2();
}

export function useStageEnabled(): boolean {
  const desktop = useMediaQuery(MEDIA.desktop);
  const reduced = usePrefersReducedMotion();
  const webgl = useSyncExternalStore(noopSubscribe, supportsWebGL2, () => false);
  return desktop && !reduced && webgl;
}
