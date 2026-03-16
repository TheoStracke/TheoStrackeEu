"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";

// Assuming Locale is defined in your i18n setup, using a standard type here.
type Locale = "pt" | "en" | "es";

export interface VellumDictionary {
  title: string;
  eyebrow: string;
  badge: string;
  role: string;
  period: string;
  description: string;
  impact: {
    label: string;
    value: number;
  };
  mockupAlt: string;
  logoAlt: string;
}

export interface ChapterVellumProps {
  t: VellumDictionary;
  lang: Locale;
}

export function ChapterVellum({ t, lang }: ChapterVellumProps) {
  const counterRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          const counter = { val: 0 };
          gsap.to(counter, {
            val: t.impact.value,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              if (counterRef.current) {
                counterRef.current.innerText = Math.floor(counter.val).toString();
              }
            },
          });
          
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [t.impact.value]);

  // Extract the dot from the badge text if present, to animate just the dot
  const badgeText = t.badge.replace("●", "").trim();

  return (
    <section className="relative w-full bg-[#F5F4EF] text-[#111111] overflow-hidden py-24 lg:py-32">
      {/* CSS Grain Texture Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1152px] px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Text Column */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-start"
          >
            <div className="mb-8">
              <Image
                src="/images/logos/vellum.png"
                alt={t.logoAlt}
                width={120}
                height={40}
                className="w-[120px] h-auto object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#111111]/60">
                {t.eyebrow}
              </span>
              <div className="flex items-center gap-2 bg-[#111111] text-[#F5F4EF] px-3 py-1 rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>{badgeText}</span>
              </div>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold mb-2">
              {t.role}
            </h3>
            <p className="text-sm font-medium text-[#111111]/60 mb-6">
              {t.period}
            </p>
            
            <p className="text-base md:text-lg text-[#111111]/80 leading-relaxed mb-10 max-w-lg">
              {t.description}
            </p>

            {/* Impact Counter */}
            <div className="flex flex-col">
              <span 
                ref={counterRef}
                className="text-5xl md:text-6xl font-bold tracking-tight"
              >
                0
              </span>
              <span className="text-sm font-medium text-[#111111]/60 mt-2 uppercase tracking-wide">
                {t.impact.label}
              </span>
            </div>
          </motion.div>

          {/* Browser Mockup Column */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="w-full relative shadow-2xl rounded-xl overflow-hidden aspect-[16/10] bg-[#e0dfd8] flex flex-col border border-black/5"
          >
            {/* Top Bar Chrome */}
            <div className="h-[40px] flex-shrink-0 flex items-center px-4 relative">
              <div className="flex items-center gap-1.5 absolute left-4 z-10">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-auto bg-white/50 rounded-full px-4 py-1 flex items-center justify-center">
                <span className="font-mono text-[10px] md:text-xs text-black/60">
                  sisced.redevellum.com.br
                </span>
              </div>
            </div>

            {/* Browser Content */}
            <div className="relative flex-grow w-full bg-white">
              <Image
                src="/images/projects/sisced-1.png"
                alt={t.mockupAlt}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}