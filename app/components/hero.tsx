"use client";

import { motion } from "framer-motion";
import { InteractiveButton } from "./interactive-button";
import { Reveal, RevealLetters, RevealWords } from "./reveal";

interface HeroDictionary {
  hero: {
    tagline: string;
    title: string;
    subtitle: string;
    cta: string;
    cardLabel?: string;
    scrollHint?: string;
    availability: string;
  };
  aboutCard: {
    points: string[];
  };
}

interface HeroProps {
  dictionary: HeroDictionary;
  onCtaClick: () => void;
}

export function Hero({ dictionary, onCtaClick }: HeroProps) {
  return (
    <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <Reveal>
          <p className="font-mono text-[12px] uppercase tracking-wider text-neutral-400">{dictionary.hero.tagline}</p>
        </Reveal>
        <div className="space-y-6">
          <RevealLetters
            text={dictionary.hero.title}
            className="font-display text-5xl leading-[0.9] tracking-[-0.02em] font-bold text-white sm:text-6xl md:text-7xl lg:text-8xl"
            delay={0.1}
            stagger={0.04}
          />
          <RevealWords
            text={dictionary.hero.subtitle}
            className="max-w-2xl text-lg leading-relaxed text-neutral-300 md:text-xl"
            delay={0.6}
            stagger={0.03}
          />
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <InteractiveButton onClick={onCtaClick}>{dictionary.hero.cta}</InteractiveButton>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-neutral-400"
          >
            {dictionary.hero.availability}
            <span className="h-[1px] w-12 bg-[var(--accent)]" />
          </motion.span>
        </div>
        <div className="scroll-hint">
          <span>{dictionary.hero.scrollHint ?? "scroll to begin"}</span>
          <div className="scroll-arrow" aria-hidden="true" />
        </div>
      </div>

      <div className="relative flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/[0.03] p-8 shadow-glow backdrop-blur-[1px]">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          {dictionary.hero.cardLabel ?? "core stack"}
        </p>
        <div className="flex flex-col gap-3 text-sm uppercase tracking-[0.18em] text-neutral-400">
          {dictionary.aboutCard.points.map((point) => (
            <span key={point} className="flex items-center gap-2">
              <div className="h-[6px] w-[6px] rounded-full bg-[var(--accent)]" /> {point}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}