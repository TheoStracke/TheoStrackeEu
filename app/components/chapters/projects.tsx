"use client";

import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRef, ViewTransition } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Locale } from "@/lib/i18n";
import { MEDIA } from "@/lib/media";
import type { Dictionary } from "@/types/dictionary";
import { FadeReveal } from "../motion/reveal";
import { useStageKeyframe } from "../stage/use-stage-keyframe";
import { ChapterHeading } from "./chapter-heading";

interface ProjectsProps {
  dict: Dictionary["projects"];
  index: string;
  lang: Locale;
}

/**
 * Lista editorial de projetos. No desktop, a prévia segue o cursor dentro da
 * linha e, no clique, a MESMA imagem vira o hero do case (View Transition).
 */
export function Projects({ dict, index, lang }: ProjectsProps) {
  const ref = useRef<HTMLElement>(null);
  useStageKeyframe("projects", ref);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section || !window.matchMedia(MEDIA.finePointer).matches) return;
      const mm = gsap.matchMedia();

      mm.add(`${MEDIA.desktop} and (prefers-reduced-motion: no-preference)`, () => {
        const rows = gsap.utils.toArray<HTMLElement>("[data-project-row]", section);
        const cleanups = rows.map((row) => {
          const preview = row.querySelector<HTMLElement>("[data-project-preview]");
          if (!preview) return () => {};
          gsap.set(preview, { autoAlpha: 0, clipPath: "inset(100% 0% 0% 0%)", xPercent: -50, yPercent: -50 });
          const xTo = gsap.quickTo(preview, "x", { duration: 0.7, ease: "power3.out" });
          const yTo = gsap.quickTo(preview, "y", { duration: 0.7, ease: "power3.out" });
          const img = preview.querySelector("img");

          const onMove = (event: PointerEvent) => {
            const rect = row.getBoundingClientRect();
            xTo(event.clientX - rect.left);
            yTo(event.clientY - rect.top);
          };
          const onEnter = (event: PointerEvent) => {
            const rect = row.getBoundingClientRect();
            gsap.set(preview, { x: event.clientX - rect.left, y: event.clientY - rect.top });
            gsap.to(preview, {
              autoAlpha: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.9,
              ease: "expo.out",
              overwrite: "auto",
            });
            if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.2, ease: "expo.out" });
          };
          const onLeave = () => {
            gsap.to(preview, {
              autoAlpha: 0,
              clipPath: "inset(0% 0% 100% 0%)",
              duration: 0.6,
              ease: "power3.in",
              overwrite: "auto",
            });
          };

          row.addEventListener("pointermove", onMove);
          row.addEventListener("pointerenter", onEnter);
          row.addEventListener("pointerleave", onLeave);
          return () => {
            row.removeEventListener("pointermove", onMove);
            row.removeEventListener("pointerenter", onEnter);
            row.removeEventListener("pointerleave", onLeave);
          };
        });
        return () => cleanups.forEach((cleanup) => cleanup());
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section id="projects" ref={ref} className="relative py-32 md:py-48">
      <div className="chapter-content container-editorial flex flex-col gap-16 md:gap-24">
        <ChapterHeading index={index} eyebrow={dict.eyebrow} title={dict.title} />

        <ol className="border-b border-line">
          {dict.items.map((project, i) => (
            <li key={project.slug}>
              <FadeReveal>
                <Link
                  href={`/${lang}/projetos/${project.slug}` as Route}
                  transitionTypes={["nav-forward"]}
                  data-project-row=""
                  data-cursor="open"
                  className="group relative grid gap-6 border-t border-line py-10 md:grid-cols-[6rem_1fr_auto] md:items-center md:gap-10 md:py-14"
                >
                  <span className="label text-faint">{String(i + 1).padStart(2, "0")}</span>

                  <div className="flex flex-col gap-3">
                    <h3 className="display text-[clamp(2.8rem,7vw,7rem)] text-white transition-transform duration-700 ease-expo md:group-hover:translate-x-6">
                      {project.title}
                    </h3>
                    <p className="text-white/60 md:text-lg">{project.summary}</p>
                  </div>

                  <div className="flex items-center justify-between gap-6 md:flex-col md:items-end">
                    <ul className="label flex max-w-[22rem] flex-wrap gap-x-4 gap-y-1 text-faint md:justify-end">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <li key={tech}>{tech}</li>
                      ))}
                    </ul>
                    <span className="label flex items-center gap-2 text-white/80">
                      {dict.cta}
                      <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
                    </span>
                  </div>

                  {/* prévia: inline no mobile, flutuante no desktop — um único elemento para o morph */}
                  <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
                    <div
                      data-project-preview=""
                      className="relative order-first aspect-[16/10] overflow-hidden rounded-xl md:pointer-events-none md:invisible md:absolute md:left-0 md:top-0 md:z-10 md:w-[min(26rem,30vw)] md:opacity-0"
                    >
                      <Image
                        src={project.gallery[0]}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 30vw, 100vw"
                        className="object-cover object-left-top"
                      />
                    </div>
                  </ViewTransition>
                </Link>
              </FadeReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
