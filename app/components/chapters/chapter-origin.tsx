"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Dictionary } from "@/types/dictionary";
import { gsap, ScrollTrigger } from "@/lib/gsap";
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

    const pinDistance = Math.max((beats.length - 1) * 100, 200);

    const ctx = gsap.context(() => {
      const validBeats = beatRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      const validImages = imageRefs.current.filter((el): el is HTMLDivElement => Boolean(el));

      gsap.set(validBeats, { autoAlpha: 0, y: 24 });
      gsap.set(validImages, { autoAlpha: 0, xPercent: 24 });

      if (validBeats[0]) {
        gsap.set(validBeats[0], { autoAlpha: 1, y: 0 });
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${pinDistance}%`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
      });

      validBeats.forEach((el, i) => {
        const start = (i / beats.length) * pinDistance;
        const end = ((i + 1) / beats.length) * pinDistance;

        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `top+=${start}% top`,
              end: `top+=${end}% top`,
              scrub: 1,
            },
          }
        );

        if (i > 0) {
          gsap.to(el, {
            autoAlpha: 0,
            y: -18,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `top+=${Math.max(end - pinDistance / (beats.length * 2), 0)}% top`,
              end: `top+=${end}% top`,
              scrub: 1,
            },
          });
        }
      });

      validImages.forEach((el, i) => {
        const index = i + 1;
        const start = (index / beats.length) * pinDistance;
        const end = ((index + 1) / beats.length) * pinDistance;

        gsap.fromTo(
          el,
          { xPercent: 30, autoAlpha: 0 },
          {
            xPercent: 0,
            autoAlpha: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `top+=${start}% top`,
              end: `top+=${end}% top`,
              scrub: 1.5,
            },
          }
        );

        gsap.to(el, {
          xPercent: -20,
          autoAlpha: 0,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `top+=${Math.max(end - pinDistance / beats.length, 0)}% top`,
            end: `top+=${Math.min(end + pinDistance / (beats.length * 2), pinDistance)}% top`,
            scrub: 1.5,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [beats]);

  return (
    <section ref={sectionRef} className="chapter-origin relative flex min-h-screen items-center">
      <div className="relative z-10 grid w-full gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="space-y-8">
          <SectionHeading label={dict.title} eyebrow={dict.eyebrow} />
          <div className="relative min-h-[240px] md:min-h-[200px]">
            {beats.map((beat, i) => (
              <div
                key={beat.key}
                ref={(el) => {
                  beatRefs.current[i] = el;
                }}
                className={`absolute inset-0 flex items-start ${i === 0 ? "opacity-100" : "opacity-0"}`}
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