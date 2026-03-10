"use client";

import { motion } from "framer-motion";
import { Reveal, RevealWords } from "./reveal";
import { Marquee } from "./marquee";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SkillsSectionProps {
  skills: string[];
  dictionary: {
    skills: {
      title: string;
      eyebrow: string;
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Heading — mirrors the pattern used in ProjectsSection
// ─────────────────────────────────────────────────────────────────────────────

function SkillsHeading({ label, eyebrow }: { label: string; eyebrow: string }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="flex flex-col gap-4">
        {/* Eyebrow */}
        <Reveal
          direction="left"
          distance={16}
          duration={0.6}
          viewport={{ once: true, margin: "-5%" }}
          className="overflow-visible"
          innerClassName="flex items-center gap-3"
        >
          <motion.span
            className="h-px w-8 origin-left bg-neutral-400"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
            {eyebrow}
          </span>
        </Reveal>

        {/* Title */}
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl leading-[1.1]">
          <RevealWords
            text={label}
            stagger={0.08}
            delay={0.1}
            wordClassName="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl"
          />
        </h2>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root section
// ─────────────────────────────────────────────────────────────────────────────

export function SkillsSection({ skills, dictionary }: SkillsSectionProps) {
  // Split skills into two halves for dual marquee rows
  const mid = Math.ceil(skills.length / 2);
  const row1 = skills.slice(0, mid);
  const row2 = skills.slice(mid);

  return (
    <section id="skills" className="space-y-10">
      <SkillsHeading
        label={dictionary.skills.title}
        eyebrow={dictionary.skills.eyebrow}
      />

      {/* Dual marquee — opposite directions for depth */}
      <Reveal
        direction="up"
        distance={20}
        delay={0.2}
        duration={0.7}
        viewport={{ once: true, margin: "-5%" }}
        className="overflow-visible"
      >
        <div className="flex flex-col gap-0">
          <Marquee
            items={row1}
            speed={38}
            direction="left"
            pauseOnHover
          />
          <Marquee
            items={row2.length > 0 ? row2 : row1}
            speed={32}
            direction="right"
            pauseOnHover
          />
        </div>
      </Reveal>
    </section>
  );
}