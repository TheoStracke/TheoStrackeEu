"use client";

import { ArrowDownRight } from "lucide-react";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useIntroPhase } from "@/lib/intro";
import { usePrefersReducedMotion } from "@/lib/media";
import type { Dictionary } from "@/types/dictionary";
import { Magnetic } from "../motion/magnetic";
import { FadeReveal, SplitReveal } from "../motion/reveal";
import { useScrollTo } from "../providers/smooth-scroll";
import { useStageKeyframe } from "../stage/use-stage-keyframe";
import { TsLogo } from "../ui/icons";

interface HeroProps {
  dict: Dictionary["hero"];
}

export function Hero({ dict }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const active = useIntroPhase() !== "loading";
  const reduced = usePrefersReducedMotion();
  const scrollTo = useScrollTo();
  useStageKeyframe("hero", ref, { at: "top top" });

  // Saída: o conteúdo sobe e se dissolve enquanto o capítulo seguinte chega
  useGSAP(
    () => {
      if (reduced) return;
      gsap.to("[data-hero-content]", {
        yPercent: -14,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom 15%", scrub: true },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-svh flex-col justify-end overflow-hidden pb-10 pt-32 md:pb-14"
    >
      {/* Sem palco (mobile/reduced-motion): o logo estático assume o papel das partículas */}
      <TsLogo
        className="pointer-events-none absolute right-[-12%] top-[18%] w-[85%] text-white/[0.05] md:hidden motion-reduce:md:block motion-reduce:md:right-[6%] motion-reduce:md:w-[38%]"
        dotColor="rgb(255 49 49 / 0.25)"
      />

      <div className="chapter-content container-editorial" data-hero-content="">
        <FadeReveal mode="manual" active={active} delay={0.15}>
          <p className="label mb-8 flex items-center gap-3 text-muted">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            {dict.tagline}
          </p>
        </FadeReveal>

        <SplitReveal
          as="h1"
          type="chars"
          mode="manual"
          active={active}
          delay={0.25}
          className="display text-[clamp(3.4rem,10vw,11.5rem)] leading-[0.85] text-white"
        >
          {dict.title}
        </SplitReveal>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[1fr_auto] md:items-end">
          <SplitReveal
            mode="manual"
            active={active}
            delay={0.8}
            className="max-w-xl text-lg leading-relaxed text-white/70 md:text-xl"
          >
            {dict.subtitle}
          </SplitReveal>

          <FadeReveal
            mode="manual"
            active={active}
            delay={1.05}
            className="flex flex-col items-start gap-6 md:items-end"
          >
            <Magnetic>
              <button
                type="button"
                data-cursor="view"
                onClick={() => scrollTo("#projects", { duration: 2.6 })}
                className="label group flex items-center gap-4 rounded-full bg-accent py-4 pl-7 pr-5 text-background transition-[gap] duration-500 ease-expo hover:gap-6"
              >
                {dict.cta}
                <ArrowDownRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-[-45deg]" />
              </button>
            </Magnetic>
            <p className="label flex items-center gap-3 text-muted">
              <span className="size-1.5 rounded-full bg-accent [animation:pulse-dot_2.4s_ease-in-out_infinite]" />
              {dict.availability}
            </p>
          </FadeReveal>
        </div>

        <FadeReveal
          mode="manual"
          active={active}
          delay={1.25}
          stagger={0.08}
          className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-line pt-6 md:mt-20"
        >
          <span className="label text-faint">{dict.cardLabel}</span>
          {dict.stack.map((point) => (
            <span key={point} className="label text-white/60">
              {point}
            </span>
          ))}
          <span className="label ml-auto hidden items-center gap-3 text-faint md:flex">
            {dict.scrollHint}
            <span className="relative block h-8 w-px overflow-hidden bg-white/10" aria-hidden="true">
              <span className="absolute inset-0 bg-accent [animation:scroll-cue_2.2s_var(--ease-expo)_infinite]" />
            </span>
          </span>
        </FadeReveal>
      </div>
    </section>
  );
}
