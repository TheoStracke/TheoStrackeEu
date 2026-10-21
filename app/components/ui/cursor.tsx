"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MEDIA, useMediaQuery, usePrefersReducedMotion } from "@/lib/media";
import type { Dictionary } from "@/types/dictionary";

type CursorLabels = Dictionary["cursor"];
export type CursorIntent = keyof CursorLabels;

interface CursorProps {
  labels: CursorLabels;
}

/**
 * Cursor contextual: ponto preciso + anel com inércia. Sobre elementos com
 * `data-cursor="view|open|drag|visit"` o anel cresce e mostra o rótulo;
 * sobre links/botões comuns ele apenas se expande.
 */
export function Cursor({ labels }: CursorProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const finePointer = useMediaQuery(MEDIA.finePointer);
  const reduced = usePrefersReducedMotion();
  const enabled = finePointer && !reduced;

  useGSAP(
    () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      const label = labelRef.current;
      if (!enabled || !dot || !ring || !label) return;

      const root = document.documentElement;
      root.classList.add("has-cursor");
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

      const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
      const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });

      let visible = false;
      let currentIntent: string | null = null;
      let restScale = 1;

      const setIntent = (target: Element | null) => {
        const host = target?.closest<HTMLElement>("[data-cursor], a, button, [role='button']");
        const intent = (host?.dataset.cursor as CursorIntent | undefined) ?? (host ? "hover" : null);
        if (intent === currentIntent) return;
        currentIntent = intent;

        const hasLabel = intent !== null && intent !== "hover" && intent in labels;
        label.textContent = hasLabel ? labels[intent as CursorIntent] : "";
        restScale = hasLabel ? 2.6 : intent === "hover" ? 1.6 : 1;
        gsap.to(ring, {
          scale: restScale,
          backgroundColor: hasLabel ? "rgba(255,49,49,0.95)" : "rgba(255,255,255,0)",
          borderColor: hasLabel ? "rgba(255,49,49,0)" : "rgba(255,255,255,0.6)",
          duration: 0.5,
          ease: "expo.out",
        });
        gsap.to(label, { autoAlpha: hasLabel ? 1 : 0, duration: 0.25 });
        gsap.to(dot, { scale: intent ? 0 : 1, duration: 0.3 });
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        dotX(event.clientX);
        dotY(event.clientY);
        ringX(event.clientX);
        ringY(event.clientY);
        if (!visible) {
          visible = true;
          gsap.set([dot, ring], { x: event.clientX, y: event.clientY });
          gsap.to([dot, ring], { autoAlpha: 1, duration: 0.4 });
        }
      };
      const onOver = (event: PointerEvent) => setIntent(event.target as Element);
      const onLeave = () => {
        visible = false;
        gsap.to([dot, ring], { autoAlpha: 0, duration: 0.3 });
      };
      const onDown = () => gsap.to(ring, { scale: restScale * 0.82, duration: 0.2, ease: "power2.out" });
      const onUp = () => gsap.to(ring, { scale: restScale, duration: 0.5, ease: "elastic.out(1, 0.4)" });

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerover", onOver, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      root.addEventListener("pointerleave", onLeave);

      return () => {
        root.classList.remove("has-cursor");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerover", onOver);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        root.removeEventListener("pointerleave", onLeave);
      };
    },
    { dependencies: [enabled, labels] },
  );

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[200] flex size-9 items-center justify-center rounded-full border border-white/60"
      >
        <span ref={labelRef} className="label invisible text-[4.5px] tracking-[0.12em] text-background" />
      </div>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[201] size-1.5 rounded-full bg-white mix-blend-difference"
      />
    </>
  );
}
