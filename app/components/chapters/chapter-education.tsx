"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/types/dictionary";
import { gsap } from "@/lib/gsap";
import { SectionHeading } from "../section-heading";

interface ChapterEducationProps {
  dict: Dictionary["education"];
}

export function ChapterEducation({ dict }: ChapterEducationProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const vignetteRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<SVGSVGElement | null>(null);

  const items = dict.items.slice(0, 2);

  useEffect(() => {
    if (!sectionRef.current || !timelineRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const paths = timelineRef.current?.querySelectorAll(".timeline-path");

      paths?.forEach((path) => {
        const svgPath = path as SVGGeometryElement;
        if (!svgPath.getTotalLength) return;

        const length = svgPath.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 30%",
            scrub: 1,
          },
        });
      });

      if (vignetteRef.current) {
        gsap.fromTo(
          vignetteRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "bottom 60%",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen py-20">
      <div className="relative z-10 space-y-10">
        <SectionHeading label={dict.title} eyebrow={dict.eyebrow} />

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
          <svg
            ref={timelineRef}
            viewBox="0 0 600 160"
            className="timeline-svg mx-auto w-full max-w-4xl"
            aria-hidden="true"
          >
            <path
              className="timeline-path"
              d="M 60 80 L 540 80"
              stroke="var(--accent)"
              strokeWidth="1"
              fill="none"
            />

            <circle
              className="timeline-path"
              cx="160"
              cy="80"
              r="6"
              stroke="var(--accent)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              className="timeline-path"
              d="M 160 80 L 160 40"
              stroke="var(--accent)"
              strokeWidth="0.5"
              fill="none"
            />

            <circle
              className="timeline-path"
              cx="400"
              cy="80"
              r="6"
              stroke="var(--accent)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              className="timeline-path"
              d="M 400 80 L 400 40"
              stroke="var(--accent)"
              strokeWidth="0.5"
              fill="none"
            />
          </svg>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {items.map((edu, index) => (
              <article
                key={`${edu.institution}-${edu.degree}`}
                className="rounded-2xl border border-white/10 bg-black/25 p-6"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{edu.period}</p>
                <h3 className="mt-3 font-display text-2xl text-white">
                  {edu.degree}
                </h3>
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-neutral-400">
                  {edu.institution}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-neutral-300">{edu.type}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {edu.skills.slice(0, 3).map((skill) => (
                    <span
                      key={`${index}-${skill}`}
                      className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-neutral-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div ref={vignetteRef} className="vignette-overlay" aria-hidden="true" />
    </section>
  );
}