"use client";

import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Locale } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/lib/media";
import type { Dictionary } from "@/types/dictionary";
import { Counter } from "../motion/counter";
import { Magnetic } from "../motion/magnetic";
import { FadeReveal, MaskReveal, SplitReveal } from "../motion/reveal";
import { useStageKeyframe } from "../stage/use-stage-keyframe";
import { ChapterHeading } from "./chapter-heading";

interface VellumProps {
  dict: Dictionary["vellum"];
  index: string;
  lang: Locale;
}

/**
 * Rede Vellum: a quebra de paleta da narrativa. O papel claro nasce de um
 * círculo na borda superior da seção, guiado pelo scroll (cobre o texto antes
 * de ele entrar), e as partículas mudam de tinta para continuar visíveis.
 */
export function Vellum({ dict, index, lang }: VellumProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  useStageKeyframe("vellum", ref);

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        "[data-paper]",
        { clipPath: "circle(0% at 50% 0%)" },
        {
          clipPath: "circle(150% at 50% 0%)",
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "top 40%", scrub: 0.6 },
        },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section id="vellum" ref={ref} className="relative text-paper-ink">
      {/* fundo de papel abaixo do canvas (z-0); conteúdo acima (z-2) */}
      <div data-paper="" aria-hidden="true" className="absolute inset-0 z-0 bg-paper" />

      <div className="chapter-content container-editorial grid gap-16 py-32 md:grid-cols-[1fr_1fr] md:gap-20 md:py-48">
        <div className="flex flex-col gap-10">
          <FadeReveal className="flex items-center gap-4">
            <Image
              src="/images/logos/vellum.png"
              alt={dict.logoAlt}
              width={56}
              height={56}
              className="size-14 rounded-full object-contain"
            />
            <span className="label text-paper-muted">
              {dict.role} · {dict.period}
            </span>
          </FadeReveal>

          <ChapterHeading index={index} eyebrow={dict.eyebrow} title={dict.title} tone="paper" />

          <SplitReveal className="max-w-xl text-lg leading-relaxed text-paper-ink/80 md:text-xl">
            {dict.description}
          </SplitReveal>

          <FadeReveal className="flex flex-col gap-2 border-t border-paper-ink/15 pt-8">
            <Counter
              value={dict.impact.value}
              locale={lang}
              className="display text-[clamp(4rem,10vw,9rem)] tabular-nums text-paper-ink"
            />
            <span className="label text-paper-muted">{dict.impact.label}</span>
          </FadeReveal>

          <FadeReveal>
            <Magnetic strength={0.2}>
              <Link
                href={`/${lang}/projetos/sisced` as Route}
                transitionTypes={["nav-forward"]}
                data-cursor="open"
                className="label group inline-flex items-center gap-4 rounded-full border border-paper-ink/25 py-4 pl-7 pr-5 transition-colors duration-500 hover:border-paper-ink hover:bg-paper-ink hover:text-paper"
              >
                {dict.cta}
                <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
              </Link>
            </Magnetic>
          </FadeReveal>
        </div>

        <MaskReveal
          direction="up"
          className="relative aspect-[4/5] self-center rounded-[1.75rem] shadow-[0_40px_120px_-40px_rgb(26_26_23/0.45)]"
        >
          <Image
            src="/images/projects/sisced-1.png"
            alt={dict.mockupAlt}
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover object-left-top"
          />
        </MaskReveal>
      </div>
    </section>
  );
}
