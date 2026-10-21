"use client";

import { useRef } from "react";
import type { Dictionary } from "@/types/dictionary";
import { FadeReveal, SplitReveal } from "../motion/reveal";
import { useStageKeyframe } from "../stage/use-stage-keyframe";

interface UnnaProps {
  dict: Dictionary["unna"];
  index: string;
}

/**
 * Unna/Adeprint — o capítulo atual. Uma folha escura desliza sobre o papel
 * do Vellum (fim de um ciclo, começo de outro) e as partículas montam os
 * módulos de um ERP.
 */
export function Unna({ dict, index }: UnnaProps) {
  const ref = useRef<HTMLElement>(null);
  useStageKeyframe("unna", ref);

  return (
    <section id="unna" ref={ref} className="relative -mt-[14vh]">
      <div aria-hidden="true" className="absolute inset-0 z-0 rounded-t-[clamp(2rem,5vw,4.5rem)] bg-background" />

      <div className="chapter-content container-editorial flex min-h-svh flex-col justify-center gap-14 py-36 md:py-48">
        <FadeReveal className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="label flex items-center gap-3 text-muted">
            <span className="text-accent">{index}</span>
            <span className="h-px w-8 bg-white/25" aria-hidden="true" />
            {dict.eyebrow}
          </span>
          <span className="label flex items-center gap-2 rounded-full border border-accent/40 px-3 py-1 text-accent">
            <span
              className="size-1.5 rounded-full bg-accent [animation:pulse-dot_2.4s_ease-in-out_infinite]"
              aria-hidden="true"
            />
            {dict.badge}
          </span>
        </FadeReveal>

        <div>
          <SplitReveal
            as="h2"
            type="chars"
            className="display whitespace-nowrap text-[clamp(2.6rem,8.5vw,8.5rem)] text-white"
          >
            {dict.title}
          </SplitReveal>
          <FadeReveal className="label mt-8 flex flex-wrap gap-x-6 gap-y-2 text-white/70">
            <span>{dict.role}</span>
            <span className="text-faint">{dict.period}</span>
          </FadeReveal>
          <SplitReveal className="mt-10 max-w-2xl text-lg md:max-w-[52%] leading-relaxed text-white/70 md:text-2xl md:leading-snug">
            {dict.description}
          </SplitReveal>
        </div>

        <FadeReveal
          as="ol"
          stagger={0.12}
          className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:max-w-[58%] md:grid-cols-3"
        >
          {dict.pillars.map((pillar, i) => (
            <li key={pillar.title} className="flex flex-col gap-6 bg-background p-6 md:p-8">
              <span className="label text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-xl font-medium tracking-tight text-white">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-white/60">{pillar.text}</p>
            </li>
          ))}
        </FadeReveal>
      </div>
    </section>
  );
}
