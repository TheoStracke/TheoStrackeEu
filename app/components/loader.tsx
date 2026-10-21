"use client";

import { useRef, useState } from "react";
import { TS_LOGO } from "@/lib/brand";
import { gsap, useGSAP } from "@/lib/gsap";
import { intro, useIntroPhase } from "@/lib/intro";
import { isStageEnabled, prefersReducedMotion } from "@/lib/media";
import { KEYFRAMES } from "@/lib/stage/layouts";
import { stage } from "@/lib/stage/store";
import { useScrollLock } from "./providers/smooth-scroll";

const SESSION_KEY = "ts:intro-seen";
const STAGE_TIMEOUT_MS = 4000;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** Faz as partículas surgirem no layout do scroll (sem loader na frente). */
function revealStageWhenReady() {
  void stage.whenReady().then(() => {
    gsap.to(stage.intro, { appear: 1, duration: 2.2, ease: "power2.out" });
  });
}

/**
 * Loader "TS.": os traços do logo se desenham, o contador acompanha o
 * carregamento real (fontes + formas na GPU) e, no desktop, o logo se
 * desfaz em partículas que viajam até o hero — sem corte.
 */
export function Loader({ label }: { label: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);
  const phase = useIntroPhase();
  useScrollLock(phase === "loading");

  useGSAP(
    () => {
      const root = rootRef.current;
      const counter = counterRef.current;
      if (!root || !counter) return;

      const withStage = isStageEnabled();
      const firstVisit = !sessionStorage.getItem(SESSION_KEY);
      const finish = () => {
        // marcado só ao concluir: um efeito re-executado (StrictMode) não pula o loader
        sessionStorage.setItem(SESSION_KEY, "1");
        intro.set("done");
        setGone(true);
      };

      // ── Visitante recorrente ou reduced-motion: sem loader ──
      if (!firstVisit || prefersReducedMotion()) {
        gsap.set(root, { autoAlpha: 0 });
        intro.set("handoff");
        if (withStage) revealStageWhenReady();
        gsap.delayedCall(1.2, finish);
        return;
      }
      // a introdução sempre começa no hero (o navegador pode restaurar o scroll do reload)
      if (!window.location.hash) {
        history.scrollRestoration = "manual";
        window.scrollTo(0, 0);
      }

      const logo = root.querySelector<SVGSVGElement>("[data-loader-logo]");
      const strokes = root.querySelectorAll("[data-loader-stroke]");
      const fills = root.querySelectorAll("[data-loader-fill]");
      const progress = { value: 0 };
      const renderCount = () => {
        counter.textContent = String(Math.round(progress.value)).padStart(3, "0");
      };

      // ── 1. Desenho do logo + contador até ~86% ──
      const draw = gsap
        .timeline()
        .fromTo(strokes, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.2, ease: "power2.inOut", stagger: 0.14 })
        .to(fills, { opacity: 1, duration: 0.45, ease: "power2.out", stagger: 0.06 }, "-=0.2")
        .to(strokes, { opacity: 0, duration: 0.3 }, "<")
        .to(progress, { value: 86, duration: 1.7, ease: "power1.inOut", onUpdate: renderCount }, 0);

      const ready = Promise.all([
        document.fonts.ready,
        withStage ? Promise.race([stage.whenReady(), wait(STAGE_TIMEOUT_MS)]) : Promise.resolve(),
        new Promise<void>((resolve) => draw.eventCallback("onComplete", () => resolve())),
      ]);

      let cancelled = false;
      void ready.then(() => {
        if (cancelled) return;
        const handoff = gsap.timeline({ onComplete: finish });
        handoff.to(progress, { value: 100, duration: 0.45, ease: "power2.out", onUpdate: renderCount });
        handoff.to(counter, { autoAlpha: 0, duration: 0.3 }, ">");

        if (withStage && stage.isReady && logo) {
          // ── 2a. Logo vira partículas no mesmo lugar e voa para o hero ──
          const rect = logo.getBoundingClientRect();
          stage.intro.layout = {
            x: (rect.left + rect.width / 2) / window.innerWidth - 0.5,
            y: 0.5 - (rect.top + rect.height / 2) / window.innerHeight,
            scale: rect.width / window.innerHeight,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            accentMix: 0,
            size: KEYFRAMES.hero.size * 0.9,
          };
          stage.intro.travel = 0;
          handoff
            .to(root, { backgroundColor: "rgba(8,8,8,0)", duration: 0.6, ease: "power2.out" }, "<")
            .to(stage.intro, { appear: 1, duration: 1.3, ease: "power3.out" }, "<")
            .to(logo, { autoAlpha: 0, duration: 0.9, ease: "power2.in" }, "<0.35")
            .call(() => intro.set("handoff"), undefined, ">-0.2")
            .to(stage.intro, { travel: 1, duration: 1.8, ease: "expo.inOut" }, "<");
        } else {
          // ── 2b. Sem palco: logo recua e a cortina sobe ──
          if (withStage) revealStageWhenReady();
          handoff
            .to(logo, { scale: 0.86, autoAlpha: 0, duration: 0.7, ease: "power3.in" }, "<")
            .call(() => intro.set("handoff"), undefined, ">-0.1")
            .to(root, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" }, "<");
        }
      });

      return () => {
        cancelled = true;
      };
    },
    { scope: rootRef },
  );

  if (gone) return null;

  const [t, s, dot] = TS_LOGO.paths;
  const viewBox = `0 0 ${TS_LOGO.viewBox.width} ${TS_LOGO.viewBox.height}`;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[250] flex items-center justify-center bg-background"
    >
      <span className="sr-only">{label}</span>
      <svg data-loader-logo="" viewBox={viewBox} className="w-[min(52vw,26rem)] overflow-visible" aria-hidden="true">
        {[t, s].map((d) => (
          <g key={d}>
            <path data-loader-fill="" d={d} fill="var(--color-ink)" opacity={0} />
            <path data-loader-stroke="" d={d} fill="none" stroke="var(--color-ink)" strokeWidth={1.2} />
          </g>
        ))}
        <path data-loader-fill="" d={dot} fill="var(--color-accent)" opacity={0} />
        <path data-loader-stroke="" d={dot} fill="none" stroke="var(--color-accent)" strokeWidth={1.2} />
      </svg>
      <span
        ref={counterRef}
        aria-hidden="true"
        className="label absolute bottom-6 right-[clamp(1rem,4vw,4rem)] tabular-nums text-white/60"
      >
        000
      </span>
    </div>
  );
}
