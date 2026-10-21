"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useStageEnabled } from "@/lib/media";
import { stage } from "@/lib/stage/store";
import type { SkillsGraphDictionary } from "@/types/chapter-skills";

// Three/R3F só são baixados quando o palco é de fato habilitado (desktop)
const StageCanvas = dynamic(() => import("./stage-canvas"), { ssr: false });

interface StageProps {
  skills: Pick<SkillsGraphDictionary, "nodes" | "links">;
}

/**
 * Palco 3D persistente: um único canvas fixo atrás de todo o site.
 * Camadas: fundos de seção (z-0) → canvas (z-1) → conteúdo (z-2).
 */
export function Stage({ skills }: StageProps) {
  const enabled = useStageEnabled();

  useEffect(() => {
    if (!enabled) return;

    const toNdc = (event: PointerEvent) => ({
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const { x, y } = toNdc(event);
      stage.pointer.x = x;
      stage.pointer.y = y;
      stage.pointer.active = true;
    };
    const onLeave = () => {
      stage.pointer.active = false;
    };
    const onDown = (event: PointerEvent) => {
      const { x, y } = toNdc(event);
      stage.pulse.x = x;
      stage.pulse.y = y;
      stage.pulse.time = performance.now();
    };
    // Posições de keyframe mudam com resize, fontes e pins
    const onRefresh = () => stage.invalidate();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    ScrollTrigger.addEventListener("refresh", onRefresh);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      stage.reset();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="stage-layer" aria-hidden="true">
      <StageCanvas skills={skills} />
    </div>
  );
}
