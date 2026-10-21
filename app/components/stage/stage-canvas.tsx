"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { buildShapeAtlas, type ShapeAtlas } from "@/lib/stage/shapes";
import type { SkillsGraphDictionary } from "@/types/chapter-skills";
import { ParticleField } from "./particle-field";

interface StageCanvasProps {
  skills: Pick<SkillsGraphDictionary, "nodes" | "links">;
}

/** Densidade de partículas por classe de hardware (16 384 ou 9 216 pontos). */
function pickAtlasSide(): number {
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 || memory <= 4 ? 96 : 128;
}

export default function StageCanvas({ skills }: StageCanvasProps) {
  const [atlas, setAtlas] = useState<ShapeAtlas | null>(null);
  const [dpr, setDpr] = useState(1.5);

  // Gera as formas fora do caminho crítico de hidratação
  useEffect(() => {
    let cancelled = false;
    const build = () => {
      if (cancelled) return;
      setAtlas(buildShapeAtlas({ side: pickAtlasSide(), skills }));
    };
    // Safari antigo não tem requestIdleCallback
    const idle = window.requestIdleCallback as Window["requestIdleCallback"] | undefined;
    const handle = idle ? idle(build, { timeout: 600 }) : window.setTimeout(build, 16);

    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [skills]);

  if (!atlas) return null;

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 35, position: [0, 0, 10], near: 0.1, far: 40 }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      {/* Ajuste adaptativo: GPU sofrendo → DPR 1; folga → volta para 1.5 */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} flipflops={3} />
      <ParticleField atlas={atlas} />
    </Canvas>
  );
}
