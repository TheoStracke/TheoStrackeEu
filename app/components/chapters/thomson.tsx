"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { stage } from "@/lib/stage/store";
import type { Dictionary } from "@/types/dictionary";
import { TrLogo } from "../ui/icons";

const PINNED = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const STATIC = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";
const GLYPHS = "01ABCDEF#%&$<>/";

interface ThomsonProps {
  dict: Dictionary["thomson"];
  index: string;
}

/**
 * Thomson Reuters em três atos guiados pelo scroll:
 * chuva de dados (acesso) → partículas formam o logo TR (descriptografia)
 * → os três aprendizados entram como relatórios.
 */
export function Thomson({ dict, index }: ThomsonProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const stageEl = section.querySelector<HTMLElement>("[data-thomson-stage]");
      const percent = section.querySelector<HTMLElement>("[data-thomson-percent]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-thomson-card]", section);
      const mm = gsap.matchMedia();

      mm.add(PINNED, () => {
        if (!stageEl || !percent) return;
        gsap.set("[data-thomson-title], [data-thomson-meta]", { autoAlpha: 0 });
        gsap.set(cards, { autoAlpha: 0, y: 60 });

        const decrypt = { value: 0 };
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 3}`,
            pin: stageEl,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          "[data-thomson-terminal]",
          { duration: 0.6, scrambleText: { text: dict.intro, chars: GLYPHS, speed: 0.4 } },
          0,
        )
          .to(
            decrypt,
            {
              value: 100,
              duration: 1.1,
              ease: "none",
              onUpdate: () => {
                percent.textContent = `${String(Math.round(decrypt.value)).padStart(3, "0")}%`;
              },
            },
            0.3,
          )
          .addLabel("logo", 1.3)
          .to("[data-thomson-title]", { autoAlpha: 1, duration: 0.1 }, "logo")
          .to(
            "[data-thomson-title]",
            { duration: 0.7, scrambleText: { text: dict.title, chars: GLYPHS, speed: 0.5, revealDelay: 0.3 } },
            "logo",
          )
          .to("[data-thomson-meta]", { autoAlpha: 1, duration: 0.4, stagger: 0.1 }, "logo+=0.3")
          .to("[data-thomson-terminal-row]", { autoAlpha: 0.35, duration: 0.3 }, "logo")
          .to(cards, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.25 }, "logo+=0.9")
          .to({}, { duration: 0.6 });

        const st = tl.scrollTrigger!;
        const at = (time: number) => () => st.start + (st.end - st.start) * (time / tl.duration());
        const offs = [
          stage.register("thomson:rain", "thomson-rain", () => st.start),
          stage.register("thomson:logo", "thomson-logo", at(tl.labels.logo + 0.35)),
          stage.register("thomson:end", "thomson-logo", () => st.end),
        ];
        return () => offs.forEach((off) => off());
      });

      mm.add(STATIC, () => {
        gsap.from(cards, {
          y: 40,
          autoAlpha: 0,
          stagger: 0.15,
          scrollTrigger: { trigger: cards[0], start: "top 88%", toggleActions: "play none none reverse" },
        });
        if (percent) percent.textContent = "100%";
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [dict] },
  );

  return (
    <section id="thomson" ref={ref} className="relative">
      <div data-thomson-stage="" className="relative min-h-svh overflow-hidden md:h-svh">
        <div className="chapter-content container-editorial flex min-h-svh flex-col justify-between gap-14 py-28 md:h-full">
          <header className="flex flex-col gap-5">
            <p className="label flex items-center gap-3 text-muted" data-thomson-meta="">
              <span className="text-accent">{index}</span>
              <span className="h-px w-8 bg-white/25" aria-hidden="true" />
              {dict.eyebrow}
            </p>
            <h2 data-thomson-title="" className="display text-[clamp(3rem,7vw,7.5rem)] text-white">
              {dict.title}
            </h2>
            <p className="label flex flex-wrap gap-x-6 gap-y-2 text-white/70" data-thomson-meta="">
              <span>{dict.role}</span>
              <span className="text-faint">{dict.period}</span>
            </p>
          </header>

          {/* terminal: acesso + progresso da descriptografia */}
          <div data-thomson-terminal-row="" className="label flex flex-col gap-2 text-accent/90 md:max-w-md">
            <span aria-hidden="true">
              &gt; <span data-thomson-terminal="">{dict.intro}</span>
            </span>
            <span className="flex items-center gap-3 text-white/50">
              {dict.decrypt}
              <span data-thomson-percent="" className="tabular-nums text-accent">
                000%
              </span>
            </span>
          </div>

          <TrLogo className="mx-auto w-40 text-white/80 md:hidden motion-reduce:md:block" />

          <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
            {dict.cards.map((card, i) => (
              <li
                key={card}
                data-thomson-card=""
                className="flex flex-col gap-6 rounded-2xl border border-line bg-background/70 p-6 md:p-8"
              >
                <span className="label text-faint" aria-hidden="true">
                  REPORT_{String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-base leading-relaxed text-white/85 md:text-lg">{card}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
