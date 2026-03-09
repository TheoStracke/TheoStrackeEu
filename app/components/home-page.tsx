"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail, MapPin, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { InteractiveButton } from "./interactive-button";
import { Marquee } from "./marquee";
import { MorphingButton } from "./morphing-button";
import { NeuralOverlay } from "./neural-overlay";
import { ProjectCard } from "./project-card";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { SideNav } from "./side-nav";

interface ActiveExperience {
  type: "experience" | "education";
  company: string;
  skills: string[];
}

interface HomePageProps {
  lang: Locale;
  dictionary: Dictionary;
}

export function HomePage({ lang, dictionary }: HomePageProps) {
  const [activeModal, setActiveModal] = useState<ActiveExperience | null>(null);

  const experiences = dictionary.experience.items;
  const education = dictionary.education.items;
  const skills = dictionary.skills.items;
  const projects = dictionary.projects.items;

  const socials = useMemo(
    () => [
      {
        label: dictionary.contact.email,
        href: "mailto:theostracke11@gmail.com",
        icon: <Mail size={18} />,
      },
      {
        label: dictionary.contact.linkedin,
        href: "https://linkedin.com/in/theostracke",
        icon: <Linkedin size={18} />,
      },
      {
        label: dictionary.contact.github,
        href: "https://github.com/theostracke",
        icon: <Github size={18} />,
      },
    ],
    [dictionary.contact.email, dictionary.contact.github, dictionary.contact.linkedin]
  );

  return (
    <main className="bg-background text-ink">
      <SideNav sections={dictionary.navigation.sections} title={dictionary.navigation.sectionsTitle} />
      <NeuralOverlay
        skills={activeModal?.skills || []}
        title={activeModal?.company || ""}
        logo={
          activeModal?.type === "experience"
            ? experiences.find((item) => item.company === activeModal?.company)?.logo
            : education.find((item) => item.institution === activeModal?.company)?.logo
        }
        subtitle={dictionary.overlay.subtitle}
        closeLabel={dictionary.overlay.close}
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
      />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 pb-24 pt-16 md:px-12 lg:px-20">
        <header className="flex items-center justify-between text-xs uppercase tracking-wider text-neutral-500">
          <Image src="/images/logos/ts.svg" alt="TS Logo" width={40} height={40} className="h-10 w-auto" />
          <LanguageSwitcher currentLocale={lang} labels={dictionary.languageSwitcher} />
            <span className="hidden items-center gap-2 font-mono text-[13px] md:flex">
              <MapPin size={14} /> {dictionary.hero.location}
            </span>
       
        </header>

        <section id="hero" className="relative grid min-h-[70vh] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <Reveal>
              <p className="font-mono text-[12px] uppercase tracking-wider text-neutral-500">{dictionary.hero.tagline}</p>
            </Reveal>
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
                className="font-display text-5xl leading-[0.9] tracking-[-0.02em] font-bold sm:text-6xl md:text-7xl lg:text-8xl"
              >
                {dictionary.hero.title}
              </motion.h1>
              <Reveal>
                <p className="max-w-2xl text-lg leading-relaxed text-neutral-700 md:text-xl">{dictionary.hero.subtitle}</p>
              </Reveal>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <InteractiveButton
                onClick={() => {
                  const element = document.getElementById("projects");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                {dictionary.hero.cta}
              </InteractiveButton>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-neutral-500"
              >
                {dictionary.hero.availability}
                <span className="h-[1px] w-12 bg-ink" />
              </motion.span>
            </div>
          </div>

          <div id="about" className="relative flex flex-col gap-6 rounded-3xl border border-ink/10 bg-white/60 p-8 shadow-glow">
            <Reveal>
              <p className="text-sm leading-relaxed text-neutral-700">{dictionary.aboutCard.description}</p>
            </Reveal>
            <div className="flex flex-col gap-3 text-sm uppercase tracking-[0.18em] text-neutral-600">
              {dictionary.aboutCard.points.map((point) => (
                <span key={point} className="flex items-center gap-2">
                  <div className="h-[6px] w-[6px] rounded-full bg-ink" /> {point}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="space-y-10">
          <SectionHeading label={dictionary.about.title} eyebrow={dictionary.about.eyebrow} />
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            <Reveal>
              <p className="max-w-xl text-xl leading-relaxed text-neutral-700">{dictionary.about.description}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-col gap-3 text-sm uppercase tracking-[0.2em] text-neutral-600">
                {dictionary.about.highlights.map((highlight) => (
                  <span key={highlight} className="flex items-center gap-2">
                    <ArrowUpRight size={16} /> {highlight}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="experience" className="space-y-10">
          <SectionHeading label={dictionary.experience.title} eyebrow={dictionary.experience.eyebrow} />
          <div>
            {experiences.map((exp) => (
              <Reveal key={exp.company} className="relative w-full py-12 border-b border-neutral-200">
                <div className="w-full pr-32 space-y-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{exp.period}</p>
                  <div className="space-y-1 flex items-start justify-between">
                    <div>
                      <p className="font-display text-2xl md:text-3xl">{exp.company}</p>
                      {exp.role ? <p className="text-sm uppercase tracking-[0.18em] text-neutral-600">{exp.role}</p> : null}
                    </div>
                    <MorphingButton
                      label={dictionary.experience.skillButton}
                      onClick={() => setActiveModal({ type: "experience", company: exp.company, skills: exp.skills })}
                    />
                  </div>
                  <p className="text-lg leading-relaxed text-neutral-700">{exp.details}</p>
                </div>
                <div className="hidden md:flex absolute right-0 top-12 w-24 h-24 bg-white border border-neutral-100 rounded-lg items-center justify-center">
                  <img src={exp.logo} alt={`${exp.company} logo`} className="h-full w-full object-contain" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="education" className="space-y-10">
          <SectionHeading label={dictionary.education.title} eyebrow={dictionary.education.eyebrow} />
          <div>
            {education.map((edu) => (
              <Reveal key={edu.degree} className="relative w-full py-12 border-b border-neutral-200">
                <div className="w-full pr-32 space-y-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{edu.period}</p>
                  <div className="space-y-1 flex items-start justify-between">
                    <div>
                      <p className="font-display text-2xl md:text-3xl">{edu.institution}</p>
                      <p className="text-sm uppercase tracking-[0.18em] text-neutral-600">{edu.type}</p>
                    </div>
                    <MorphingButton
                      label={dictionary.education.skillButton}
                      onClick={() => setActiveModal({ type: "education", company: edu.institution, skills: edu.skills })}
                    />
                  </div>
                  <p className="text-lg leading-relaxed text-neutral-700">{edu.degree}</p>
                </div>
                <div className="hidden md:flex absolute right-0 top-12 w-24 h-24 bg-white border border-neutral-100 rounded-lg items-center justify-center">
                  <img src={edu.logo} alt={`${edu.institution} logo`} className="h-full w-full object-contain" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="skills" className="space-y-6">
          <SectionHeading label={dictionary.skills.title} eyebrow={dictionary.skills.eyebrow} />
          <Marquee items={skills} />
        </section>

        <section id="projects" className="space-y-10">
          <SectionHeading label={dictionary.projects.title} eyebrow={dictionary.projects.eyebrow} />
          <div className="grid items-stretch gap-8 md:gap-10 lg:grid-cols-2 p-1">
            {projects.map((project, index) => (
              <Reveal key={project.title} delay={index * 0.15}>
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
              </Reveal>
            ))}
          </div>
        </section>

        <footer id="connect" className="space-y-8 rounded-3xl border border-ink/10 bg-white/60 p-10 shadow-card">
          <SectionHeading label={dictionary.contact.title} eyebrow={dictionary.contact.eyebrow} />
          <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.18em] text-neutral-600">
            {socials.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex items-center gap-2 rounded-full border border-ink/10 px-5 py-3 transition-colors duration-300 hover:-translate-y-0.5 hover:border-ink"
              >
                <span className="text-ink/80 group-hover:text-ink">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
            <span className="flex items-center gap-2 text-xs text-neutral-500">
              <MapPin size={16} /> {dictionary.contact.location}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
