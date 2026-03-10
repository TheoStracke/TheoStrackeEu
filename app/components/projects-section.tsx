"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProjectCard, type ProjectCardProps } from "./project-card";
import { Reveal, RevealWords, StaggerContainer, StaggerItem } from "./reveal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectsSectionProps {
  projects: ProjectCardProps[];
  dictionary: {
    projects: {
      title: string;
      eyebrow: string;
      hoverCta: string;
      visitLabel: string;
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ambient parallax blobs
// ─────────────────────────────────────────────────────────────────────────────

function SectionAmbience({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full opacity-[0.05]"
        style={{
          y: y1,
          background: "radial-gradient(circle, rgba(99,102,241,1) 0%, transparent 70%)",
          filter: "blur(72px)",
        }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 h-[440px] w-[440px] rounded-full opacity-[0.04]"
        style={{
          y: y2,
          background: "radial-gradient(circle, rgba(245,158,11,1) 0%, transparent 70%)",
          filter: "blur(64px)",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section heading
// ─────────────────────────────────────────────────────────────────────────────

function ProjectsSectionHeading({ label, eyebrow }: { label: string; eyebrow: string }) {
  return (
    <div className="flex flex-col gap-4">
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

      <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl leading-[1.1]">
        <RevealWords
          text={label}
          stagger={0.08}
          delay={0.1}
          wordClassName="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl"
        />
      </h2>

      <Reveal
        direction="fade"
        delay={0.35}
        duration={0.7}
        viewport={{ once: true, margin: "-5%" }}
        className="overflow-visible"
      >
        <div className="h-px bg-gradient-to-r from-neutral-200 via-neutral-300 to-transparent" />
      </Reveal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mono index badge
// ─────────────────────────────────────────────────────────────────────────────

function CardIndex({ n }: { n: number }) {
  return (
    <span className="font-mono text-[11px] tracking-[0.25em] text-neutral-400 select-none tabular-nums">
      {String(n).padStart(2, "0")}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectsSection({ projects, dictionary }: ProjectsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="projects" ref={sectionRef} className="relative py-24 sm:py-32">
      <SectionAmbience containerRef={sectionRef} />

      <div className="space-y-14 sm:space-y-16">
        <div className="max-w-xl">
          <ProjectsSectionHeading
            label={dictionary.projects.title}
            eyebrow={dictionary.projects.eyebrow}
          />
        </div>

        <StaggerContainer
          stagger={0.14}
          delay={0.05}
          className="grid items-start gap-10 md:gap-12 lg:grid-cols-2 p-1"
        >
          {projects.map((project, index) => (
            <StaggerItem
              key={project.title}
              direction="up"
              distance={32}
              className="flex flex-col gap-3"
            >
              <CardIndex n={index + 1} />
              <ProjectCard
                title={project.title}
                description={project.description}
                technologies={project.technologies}
                href={project.href}
                thumbnail={project.thumbnail}
                logo={project.logo}
                gallery={project.gallery}
                hoverCtaText={dictionary.projects.hoverCta}
                visitLabel={dictionary.projects.visitLabel}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}