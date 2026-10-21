"use client";

import clsx from "clsx";
import { useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { computeSkillsLayout, SKILLS_ASPECT } from "@/lib/skills-layout";
import { stage } from "@/lib/stage/store";
import type { Dictionary } from "@/types/dictionary";
import { FadeReveal } from "../motion/reveal";
import { ChapterHeading } from "./chapter-heading";

const PINNED = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

interface SkillsProps {
  dict: Dictionary["skills"];
  index: string;
}

/**
 * Grafo de skills. As partículas formam a constelação (mesmo layout
 * determinístico) e o SVG acrescenta rótulos, arestas e a interação.
 */
export function Skills({ dict, index }: SkillsProps) {
  const ref = useRef<HTMLElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const placed = useMemo(() => computeSkillsLayout(dict.nodes, dict.links), [dict.nodes, dict.links]);
  const byId = useMemo(() => new Map(placed.map((node) => [node.id, node])), [placed]);

  // vizinhança e projetos de cada nó (para o destaque no hover/foco)
  const relations = useMemo(() => {
    const map = new Map<string, { neighbors: Set<string>; projects: Set<string> }>();
    for (const node of dict.nodes) map.set(node.id, { neighbors: new Set([node.id]), projects: new Set() });
    for (const link of dict.links) {
      for (const [a, b] of [
        [link.source, link.target],
        [link.target, link.source],
      ]) {
        const entry = map.get(a);
        entry?.neighbors.add(b);
        link.projects.forEach((project) => entry?.projects.add(project));
      }
    }
    return map;
  }, [dict.nodes, dict.links]);

  useGSAP(
    () => {
      const section = ref.current;
      const graph = graphRef.current;
      if (!section || !graph) return;
      const mm = gsap.matchMedia();

      mm.add(PINNED, () => {
        gsap.set("[data-skill-node]", { autoAlpha: 0 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 1.5}`,
            pin: "[data-skills-stage]",
            scrub: 0.8,
            invalidateOnRefresh: true,
            // a escala das partículas acompanha o tamanho real do grafo
            onRefresh: () => stage.override("skills", { scale: graph.offsetHeight / window.innerHeight }),
          },
        });
        tl.fromTo(
          "[data-skill-edge]",
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.6, stagger: 0.015, ease: "none" },
          0.1,
        )
          .to("[data-skill-node]", { autoAlpha: 1, duration: 0.3, stagger: 0.02 }, 0.15)
          .to({}, { duration: 0.6 });

        const st = tl.scrollTrigger!;
        const offs = [
          stage.register("skills:start", "skills", () => st.start),
          stage.register("skills:end", "skills", () => st.end),
        ];
        return () => {
          offs.forEach((off) => off());
          stage.override("skills", null);
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  const active = focused ? relations.get(focused) : null;
  const viewBox = `${-SKILLS_ASPECT} -1 ${SKILLS_ASPECT * 2} 2`;

  return (
    <section id="skills" ref={ref} className="relative">
      <div data-skills-stage="" className="relative min-h-svh overflow-hidden py-28 md:h-svh md:py-0">
        <div className="chapter-content container-editorial flex flex-col gap-4 md:absolute md:inset-x-0 md:top-0 md:pt-28">
          <ChapterHeading index={index} eyebrow={dict.eyebrow} title={dict.title} size="md" />
          <p className="label max-w-xs text-faint">{dict.hint}</p>
        </div>

        {/* Grafo (desktop): centralizado para coincidir com a constelação de partículas */}
        <div
          ref={graphRef}
          className="chapter-content absolute left-1/2 top-1/2 hidden aspect-[1.6] h-[min(66svh,calc(92vw/1.6))] -translate-x-1/2 -translate-y-1/2 md:block"
        >
          <svg viewBox={viewBox} className="size-full overflow-visible" role="group" aria-label={dict.title}>
            <g aria-hidden="true">
              {dict.links.map((link) => {
                const a = byId.get(link.source);
                const b = byId.get(link.target);
                if (!a || !b) return null;
                const lit = focused !== null && (link.source === focused || link.target === focused);
                return (
                  <line
                    key={`${link.source}-${link.target}`}
                    data-skill-edge=""
                    x1={a.x}
                    y1={-a.y}
                    x2={b.x}
                    y2={-b.y}
                    vectorEffect="non-scaling-stroke"
                    className={clsx(
                      "transition-[stroke,opacity] duration-500",
                      lit ? "stroke-accent opacity-90" : "stroke-white opacity-[0.12]",
                      focused && !lit && "opacity-[0.04]",
                    )}
                    strokeWidth={1}
                  />
                );
              })}
            </g>

            {placed.map((node) => {
              const dim = active !== null && active !== undefined && !active.neighbors.has(node.id);
              const isFocused = focused === node.id;
              return (
                <g
                  key={node.id}
                  data-skill-node=""
                  transform={`translate(${node.x} ${-node.y})`}
                  tabIndex={0}
                  role="button"
                  aria-label={node.label}
                  aria-pressed={isFocused}
                  className={clsx("cursor-pointer outline-none transition-opacity duration-500", dim && "opacity-25")}
                  onPointerEnter={() => setFocused(node.id)}
                  onPointerLeave={() => setFocused(null)}
                  onFocus={() => setFocused(node.id)}
                  onBlur={() => setFocused(null)}
                >
                  <circle r={0.07} fill="transparent" />
                  <circle
                    r={isFocused ? 0.022 : 0.011}
                    className={clsx("transition-[r] duration-500", isFocused ? "fill-accent" : "fill-white")}
                  />
                  <text
                    x={0.03}
                    y={0.014}
                    className={clsx(
                      "select-none font-mono uppercase transition-colors duration-500",
                      isFocused ? "fill-accent" : "fill-white/75",
                    )}
                    style={{ fontSize: 0.04, letterSpacing: "0.12em" }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* projetos onde a tecnologia em foco aparece */}
          <p aria-live="polite" className="label absolute -bottom-10 left-0 flex min-h-4 items-center gap-3 text-muted">
            {active && focused && (
              <>
                <span className="text-accent">{byId.get(focused)?.label}</span>
                <span className="h-px w-6 bg-white/25" aria-hidden="true" />
                {[...active.projects].join(" · ")}
              </>
            )}
          </p>
        </div>

        {/* Mobile: lista enxuta, sem grafo minúsculo */}
        <FadeReveal
          as="ul"
          stagger={0.03}
          className="chapter-content container-editorial mt-12 flex flex-wrap gap-2 md:hidden"
        >
          {dict.nodes.map((node) => (
            <li key={node.id} className="rounded-full border border-line px-4 py-2 text-sm text-white/75">
              {node.label}
            </li>
          ))}
        </FadeReveal>
      </div>
    </section>
  );
}
