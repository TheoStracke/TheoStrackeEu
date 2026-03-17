"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Dictionary } from "@/types/dictionary";
import { gsap } from "@/lib/gsap";
import { SectionHeading } from "../section-heading";

interface ChapterOriginProps {
  dict: Dictionary["about"];
}

interface Beat {
  key: string;
  text: string;
  image?: string;
}

export function ChapterOrigin({ dict }: ChapterOriginProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const beats = useMemo<Beat[]>(
    () => [
      {
        key: "beat1",
        text:
          dict.beat1 ??
          dict.description ??
          "Transform complex problems into fast and accessible digital products.",
      },
      {
        key: "beat2",
        text:
          dict.beat2 ??
          dict.highlights?.[0] ??
          "My enterprise support background helps prevent structural failures before they hit production.",
        image: "/images/projects/despafacil-1.png",
      },
      {
        key: "beat3",
        text:
          dict.beat3 ??
          dict.highlights?.[1] ??
          "I do not just write code. I understand product rules to design efficient technical solutions.",
        image: "/images/projects/sisced-1.png",
      },
      {
        key: "beat4",
        text:
          dict.beat4 ??
          dict.highlights?.[2] ??
          "From database to interface, I can confidently work through the full delivery pipeline.",
        image: "/images/projects/sisced-2.png",
      },
    ],
    [dict]
  );

  useEffect(() => {
    if (!sectionRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const validBeats = beatRefs.current.filter((el): el is HTMLDivElement => Boolean(el));

      validBeats.forEach((el, i) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.15,
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [beats]);

  return (
    <section ref={sectionRef} className="chapter-origin relative py-24">
      <div className="relative z-10 grid w-full gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="space-y-8">
          <SectionHeading label={dict.title} eyebrow={dict.eyebrow} />
          <div className="space-y-6">
            {beats.map((beat, i) => (
              <div
                key={beat.key}
                ref={(el) => {
                  beatRefs.current[i] = el;
                }}
              >
                <p className="max-w-xl text-2xl leading-relaxed text-neutral-200 md:text-3xl">
                  {beat.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] lg:block">
          {beats
            .filter((beat) => Boolean(beat.image))
            .map((beat, i) => (
              <div
                key={`${beat.key}-image`}
                ref={(el) => {
                  imageRefs.current[i] = el;
                }}
                className="absolute inset-0"
              >
                <img
                  src={beat.image}
                  alt="Origin chapter visual"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/45 via-black/10 to-transparent" />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}