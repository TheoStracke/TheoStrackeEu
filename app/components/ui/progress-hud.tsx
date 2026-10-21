"use client";

import { useRef, useState } from "react";
import { CHAPTERS, formatIndex } from "@/lib/chapters";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "@/types/dictionary";

interface ProgressHudProps {
  labels: Dictionary["nav"]["chapters"];
}

/**
 * Indicador "03 / 10 — Formação" + barra de progresso vertical.
 * A barra anima por transform (scaleY) direto no DOM, sem re-render;
 * o React só re-renderiza quando o capítulo ativo muda.
 */
export function ProgressHud({ labels }: ProgressHudProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const bar = barRef.current;
      if (!bar) return;

      gsap.set(bar, { scaleY: 0, transformOrigin: "top center" });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        // mede depois dos pins dos capítulos (criados mais abaixo na árvore)
        refreshPriority: -1,
        onUpdate: (self) => gsap.set(bar, { scaleY: self.progress }),
      });

      CHAPTERS.forEach((chapter, index) => {
        const section = document.getElementById(chapter);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) setActive(index);
          },
        });
      });
    },
    { scope: rootRef },
  );

  // troca de rótulo com um "scramble" curto
  useGSAP(
    () => {
      const label = labelRef.current;
      if (!label) return;
      gsap.to(label, {
        duration: 0.7,
        scrambleText: { text: labels[CHAPTERS[active]], chars: "upperCase", speed: 0.6 },
        ease: "none",
      });
    },
    { dependencies: [active, labels], scope: rootRef },
  );

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none text-white mix-blend-difference">
      <div className="label fixed bottom-6 left-[clamp(1rem,4vw,4rem)] z-[95] hidden items-center gap-3 md:flex">
        <span className="tabular-nums">{formatIndex(active)}</span>
        <span className="h-px w-8 bg-white/40" />
        <span className="tabular-nums text-white/50">{formatIndex(CHAPTERS.length - 1)}</span>
        <span ref={labelRef} className="ml-3 text-white/70">
          {labels[CHAPTERS[0]]}
        </span>
      </div>

      <div className="fixed right-[clamp(1rem,2vw,2rem)] top-1/2 z-[95] hidden h-40 w-px -translate-y-1/2 bg-white/15 md:block">
        <div ref={barRef} className="h-full w-full bg-white" />
      </div>
    </div>
  );
}
