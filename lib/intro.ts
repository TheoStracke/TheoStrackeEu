"use client";

import { useSyncExternalStore } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// Handshake loader → hero. Funciona com ou sem palco 3D:
//   loading  → loader na tela, scroll travado
//   handoff  → logo vira partículas / painel sobe; hero começa a entrar
//   done     → experiência liberada
// ═══════════════════════════════════════════════════════════════════════════

export type IntroPhase = "loading" | "handoff" | "done";

let phase: IntroPhase = "loading";
const listeners = new Set<() => void>();

export const intro = {
  get phase() {
    return phase;
  },
  set(next: IntroPhase) {
    if (next === phase) return;
    phase = next;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useIntroPhase(): IntroPhase {
  return useSyncExternalStore(
    intro.subscribe,
    () => phase,
    () => "loading",
  );
}
