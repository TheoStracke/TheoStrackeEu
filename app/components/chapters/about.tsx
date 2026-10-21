"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { stage } from "@/lib/stage/store";
import type { Dictionary } from "@/types/dictionary";
import { ChapterHeading } from "./chapter-heading";

const IMAGES = ["/images/projects/despafacil-1.png", "/images/projects/sisced-1.png", "/images/projects/sisced-2.png"];

/** ≥ md com movimento liberado: capítulo fixado e narrado pelo scroll. */
const PINNED = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const STATIC = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";

interface AboutProps {
  dict: Dictionary["about"];
  index: string;
}

export function About({ dict, index }: AboutProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", section);
      const frames = gsap.utils.toArray<HTMLElement>("[data-frame]", section);
      const ticks = gsap.utils.toArray<HTMLElement>("[data-tick]", section);
      const mm = gsap.matchMedia();

      mm.add(PINNED, () => {
        section.dataset.pinned = "";
        const splits = beats.map((beat) => SplitText.create(beat, { type: "lines", mask: "lines" }));
        gsap.set(beats, { autoAlpha: 1 });
        gsap.set(beats.slice(1), { position: "absolute", inset: 0 });
        splits.slice(1).forEach((split) => gsap.set(split.lines, { yPercent: 110 }));
        gsap.set(frames, { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(ticks.slice(1), { scaleX: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 3.2}`,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });

        // cada beat: o anterior sobe e some, o próximo nasce da máscara + imagem entra por cortina
        splits.forEach((split, i) => {
          if (i === 0) return;
          const at = i;
          tl.to(splits[i - 1].lines, { yPercent: -110, duration: 0.5, stagger: 0.04 }, at)
            .to(split.lines, { yPercent: 0, duration: 0.6, stagger: 0.05 }, at + 0.25)
            .to(ticks[i], { scaleX: 1, duration: 0.6, ease: "none" }, at)
            .to(frames[i - 1], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8 }, at)
            .from(frames[i - 1].querySelector("img"), { scale: 1.3, duration: 1 }, at);
        });
        tl.to({}, { duration: 0.4 });

        const st = tl.scrollTrigger!;
        const offStart = stage.register("about:start", "about", () => st.start);
        const offEnd = stage.register("about:end", "about", () => st.end);
        return () => {
          offStart();
          offEnd();
          splits.forEach((split) => split.revert());
          delete section.dataset.pinned;
        };
      });

      mm.add(STATIC, () => {
        [...beats, ...frames].forEach((el) => {
          gsap.from(el, {
            y: 40,
            autoAlpha: 0,
            duration: 1.1,
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
          });
        });
        gsap.set(beats, { autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section id="about" ref={ref} className="group/about relative">
      <div className="chapter-content container-editorial grid min-h-svh items-center gap-14 py-28 md:grid-cols-[1.15fr_0.85fr] md:gap-20 md:pb-16 md:pt-28">
        <div className="flex flex-col gap-14">
          <ChapterHeading index={index} eyebrow={dict.eyebrow} title={dict.title} />

          <div className="relative flex flex-col gap-10 md:text-[clamp(1.6rem,2.6vw,2.6rem)] group-data-[pinned]/about:block group-data-[pinned]/about:min-h-[9.5em]">
            {dict.beats.map((beat) => (
              <p
                key={beat}
                data-beat=""
                className="max-w-[24ch] text-2xl font-medium leading-[1.2] tracking-[-0.01em] text-white/90 md:text-[length:inherit]"
              >
                {beat}
              </p>
            ))}
          </div>

          <div className="hidden gap-2 group-data-[pinned]/about:flex" aria-hidden="true">
            {dict.beats.map((beat) => (
              <span key={beat} className="h-px w-14 overflow-hidden bg-white/15">
                <span data-tick="" className="block h-full w-full origin-left bg-accent" />
              </span>
            ))}
          </div>
        </div>

        {/* Janela de imagens: vazia no beat 1 (as partículas orbitam atrás) */}
        <div className="relative flex flex-col gap-6 group-data-[pinned]/about:block group-data-[pinned]/about:aspect-[4/5] group-data-[pinned]/about:max-h-[72svh] group-data-[pinned]/about:w-full group-data-[pinned]/about:rounded-[1.75rem] group-data-[pinned]/about:border group-data-[pinned]/about:border-line">
          {IMAGES.map((src, i) => (
            <div
              key={src}
              data-frame=""
              className="relative aspect-[4/3] overflow-hidden rounded-2xl group-data-[pinned]/about:absolute group-data-[pinned]/about:inset-0 group-data-[pinned]/about:aspect-auto group-data-[pinned]/about:rounded-[1.75rem]"
            >
              <Image
                src={src}
                alt={dict.imageAlts[i]}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover object-left-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
