"use client";

import clsx from "clsx";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/media";
import type { Dictionary } from "@/types/dictionary";
import { FadeReveal, SplitReveal } from "../motion/reveal";
import { useStageKeyframe } from "../stage/use-stage-keyframe";
import { ChapterHeading } from "./chapter-heading";

interface EducationProps {
  dict: Dictionary["education"];
  index: string;
}

export function Education({ dict, index }: EducationProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  useStageKeyframe("education", ref);

  // A linha do tempo se desenha acompanhando o scroll
  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        "[data-timeline-line]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-timeline]", start: "top 70%", end: "bottom 60%", scrub: 0.6 },
        },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section id="education" ref={ref} className="relative py-32 md:py-48">
      <div className="chapter-content container-editorial grid gap-16 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
        {/* coluna esquerda livre no desktop: o livro de partículas ocupa esse espaço */}
        <ChapterHeading
          index={index}
          eyebrow={dict.eyebrow}
          title={dict.title}
          className="md:sticky md:top-32 md:self-start"
        />

        <ol data-timeline="" className="relative flex flex-col gap-20 pl-8 md:gap-28 md:pl-14">
          <span className="absolute left-0 top-2 h-full w-px bg-white/10" aria-hidden="true">
            <span data-timeline-line="" className="block h-full w-full origin-top bg-accent" />
          </span>

          {dict.items.map((item) => {
            const ongoing = item.current;
            return (
              <li key={item.degree} className="relative">
                <span
                  aria-hidden="true"
                  className={clsx(
                    "absolute -left-8 top-2 size-2 -translate-x-1/2 rounded-full md:-left-14",
                    ongoing ? "bg-accent [animation:pulse-dot_2.4s_ease-in-out_infinite]" : "bg-white/60",
                  )}
                />
                <FadeReveal stagger={0.08} className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span className="label text-white/80">{item.period}</span>
                  <span
                    className={clsx(
                      "label rounded-full border px-3 py-1",
                      ongoing ? "border-accent/50 text-accent" : "border-white/15 text-muted",
                    )}
                  >
                    {item.status}
                  </span>
                  <span className="label text-faint">{item.type}</span>
                </FadeReveal>

                <SplitReveal as="h3" className="display mt-6 text-[clamp(2rem,4.2vw,4rem)] text-white">
                  {item.degree}
                </SplitReveal>
                <FadeReveal>
                  <p className="mt-3 text-lg text-white/60">{item.institution}</p>
                </FadeReveal>

                <FadeReveal as="ul" stagger={0.05} className="mt-8 flex flex-wrap gap-2">
                  {item.skills.map((skill) => (
                    <li key={skill} className="rounded-full border border-line px-4 py-2 text-sm text-white/70">
                      {skill}
                    </li>
                  ))}
                </FadeReveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
