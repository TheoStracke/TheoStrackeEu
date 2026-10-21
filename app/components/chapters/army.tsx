"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { MEDIA } from "@/lib/media";
import { stage } from "@/lib/stage/store";
import type { Dictionary } from "@/types/dictionary";

const PINNED = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const STATIC = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";

interface ArmyProps {
  dict: Dictionary["army"];
  index: string;
}

/**
 * Exército: cena noturna. O terreno de partículas fica sob neblina e uma
 * "lanterna" (vinheta que segue o cursor + foco no shader) revela o entorno —
 * herança do antigo FPS, agora sem travar o scroll.
 */
export function Army({ dict, index }: ArmyProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const stageEl = section.querySelector<HTMLElement>("[data-army-stage]");
      const light = section.querySelector<HTMLElement>("[data-army-light]");
      const beats = gsap.utils.toArray<HTMLElement>("[data-army-beat]", section);
      const mm = gsap.matchMedia();

      mm.add(PINNED, () => {
        if (!stageEl || !light) return;
        const title = SplitText.create("[data-army-title]", { type: "chars", mask: "chars" });
        const intro = SplitText.create("[data-army-intro]", { type: "words", mask: "words" });

        gsap.set([...title.masks, ...intro.masks], { paddingBottom: "0.14em", marginBottom: "-0.14em" });
        gsap.set(title.chars, { yPercent: 130 });
        gsap.set(intro.words, { yPercent: 130 });
        gsap.set(beats, { autoAlpha: 0, y: 30 });
        gsap.set("[data-army-meta]", { autoAlpha: 0 });
        gsap.set("[data-army-tick]", { scaleX: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.8}`,
            pin: stageEl,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(title.chars, { yPercent: 0, stagger: 0.02, duration: 0.6 }, 0)
          .to("[data-army-meta]", { autoAlpha: 1, duration: 0.4, stagger: 0.1 }, 0.3)
          .to(intro.words, { yPercent: 0, stagger: 0.03, duration: 0.5 }, 0.5)
          .to(intro.words, { yPercent: -110, stagger: 0.02, duration: 0.4 }, 1.4);

        // diário da missão: cada registro acende e o anterior esmaece
        beats.forEach((beat, i) => {
          const at = 1.7 + i * 0.8;
          tl.to(beat, { autoAlpha: 1, y: 0, duration: 0.5 }, at);
          tl.to(`[data-army-tick="${i}"]`, { scaleX: 1, duration: 0.6, ease: "none" }, at);
          if (i > 0) tl.to(beats[i - 1], { autoAlpha: 0.28, duration: 0.4 }, at);
        });
        tl.to({}, { duration: 0.5 });

        // lanterna: centro da vinheta segue o cursor com inércia
        const setX = gsap.quickTo(light, "--light-x", { duration: 0.8, ease: "power3.out" });
        const setY = gsap.quickTo(light, "--light-y", { duration: 0.8, ease: "power3.out" });
        const onMove = (event: PointerEvent) => {
          setX((event.clientX / window.innerWidth) * 100);
          setY((event.clientY / window.innerHeight) * 100);
        };
        const finePointer = window.matchMedia(MEDIA.finePointer).matches;
        if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });

        const st = tl.scrollTrigger!;
        const offStart = stage.register("army:start", "army", () => st.start);
        const offEnd = stage.register("army:end", "army", () => st.end);
        return () => {
          window.removeEventListener("pointermove", onMove);
          offStart();
          offEnd();
          title.revert();
          intro.revert();
        };
      });

      mm.add(STATIC, () => {
        gsap.from(beats, {
          y: 30,
          autoAlpha: 0,
          stagger: 0.15,
          scrollTrigger: { trigger: beats[0], start: "top 85%", toggleActions: "play none none reverse" },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section id="army" ref={ref} className="relative">
      <div data-army-stage="" className="relative min-h-svh overflow-hidden md:h-svh">
        {/* lanterna: vinheta escura com centro transparente seguindo o cursor */}
        <div
          data-army-light=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] [--light-x:50] [--light-y:55]"
          style={{
            background:
              "radial-gradient(circle at calc(var(--light-x) * 1%) calc(var(--light-y) * 1%), transparent 0%, rgb(8 8 8 / 0.05) 25%, rgb(8 8 8 / 0.4) 62%, rgb(8 8 8 / 0.72) 100%)",
          }}
        />

        {/* moldura HUD */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-6 z-[2] hidden md:block">
          {[
            "left-0 top-0 border-l border-t",
            "right-0 top-0 border-r border-t",
            "bottom-0 left-0 border-b border-l",
            "bottom-0 right-0 border-b border-r",
          ].map((corner) => (
            <span key={corner} className={`absolute size-6 border-white/30 ${corner}`} />
          ))}
        </div>

        <div className="chapter-content container-editorial z-[3] flex min-h-svh flex-col justify-between gap-16 py-28 md:h-full">
          <header className="flex flex-col gap-5">
            <p className="label flex items-center gap-3 text-muted" data-army-meta="">
              <span className="text-accent">{index}</span>
              <span className="h-px w-8 bg-white/25" aria-hidden="true" />
              {dict.eyebrow}
            </p>
            <h2 data-army-title="" className="display text-[clamp(3rem,7vw,7.5rem)] text-white">
              {dict.title}
            </h2>
            <p className="label flex flex-wrap gap-x-6 gap-y-2 text-white/70" data-army-meta="">
              <span>{dict.role}</span>
              <span className="text-faint">{dict.period}</span>
            </p>
          </header>

          <p
            data-army-intro=""
            className="max-w-3xl text-[clamp(1.5rem,3.2vw,3rem)] font-medium leading-[1.15] tracking-[-0.015em] text-white/90 md:absolute md:left-1/2 md:top-[60%] md:w-[min(48rem,80vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:text-center"
          >
            {dict.intro}
          </p>

          <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
            {dict.beats.map((beat, i) => (
              <li key={beat} data-army-beat="" className="flex flex-col gap-4">
                <span className="label flex items-center gap-3 text-accent">
                  {String(i + 1).padStart(2, "0")} / {String(dict.beats.length).padStart(2, "0")}
                  <span className="h-px flex-1 overflow-hidden bg-white/15" aria-hidden="true">
                    <span data-army-tick={i} className="block h-full w-full origin-left bg-accent" />
                  </span>
                </span>
                <p className="text-base leading-relaxed text-white/80 md:text-lg">{beat}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
