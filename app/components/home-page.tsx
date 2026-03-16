"use client";

import { Github, Linkedin, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dictionary } from "@/types/dictionary";
import type { ArmyDictionary } from "@/types/chapter-army";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { SectionHeading } from "./section-heading";
import { ProjectsSection } from "./projects-section";
import { StoryProgress } from "./story-progress";
import { ChapterWrapper } from "./chapter-wrapper";
import { ChapterIndicator } from "./chapter-indicator";
import { scrollTo } from "./lenis-provider";
import { Hero } from "./hero";
import { ChapterOrigin } from "./chapters/chapter-origin";
import { ChapterEducation } from "./chapters/chapter-education";
import { ChapterArmy } from "./chapters/chapter-army";
import { ChapterThomson } from "./chapters/chapter-thomson";
import { ScrollTrigger } from "@/lib/gsap";

interface HomePageProps {
  lang: Locale;
  dictionary: Dictionary;
}

interface ChapterDefinition {
  id: string;
  trigger: string;
  component: ReactNode;
}

export function HomePage({ lang, dictionary }: HomePageProps) {
  const [activeChapterId, setActiveChapterId] = useState("hero");
  const [isHeaderSolid, setIsHeaderSolid] = useState(false);

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

  const sectionLabelMap = useMemo(
    () =>
      Object.fromEntries(
        dictionary.navigation.sections.map((section) => [section.id, section.label])
      ),
    [dictionary.navigation.sections]
  );
  const armyDictionary = (dictionary as Dictionary & { army: ArmyDictionary }).army;

  const CHAPTERS: ChapterDefinition[] = [
    {
      id: "hero",
      trigger: "top top",
      component: (
        <Hero
          dictionary={dictionary}
          onCtaClick={() => scrollTo("#about", { duration: 1.2 })}
        />
      ),
    },
    {
      id: "about",
      trigger: "top top",
      component: <ChapterOrigin dict={dictionary.about} />,
    },
    {
      id: "education",
      trigger: "top top",
      component: <ChapterEducation dict={dictionary.education} />,
    },
    {
      id: "army",
      trigger: "top top",
      component: (
        <ChapterArmy
          dict={armyDictionary}
          isActive={activeChapterId === "army"}
          onComplete={() => scrollTo("#thomson", { duration: 1.2 })}
          onSkip={() => scrollTo("#thomson", { duration: 1.2 })}
        />
      ),
    },
    {
      id: "thomson",
      trigger: "top top",
      component: (
        <ChapterThomson
          dict={dictionary.thomson}
          isActive={activeChapterId === "thomson"}
          onComplete={() => scrollTo("#vellum", { duration: 1.2 })}
          onSkip={() => scrollTo("#vellum", { duration: 1.2 })}
        />
      ),
    },
    {
      id: "vellum",
      trigger: "top top",
      component: (
        <div className="flex min-h-screen items-center justify-center border border-dashed border-white/20 font-mono text-white/50">
          [ CAPITULO VELLUM - EM CONSTRUCAO ]
        </div>
      ),
    },
    {
      id: "projects",
      trigger: "top 65%",
      component: (
        <div className="relative z-10">
          <ProjectsSection projects={projects} dictionary={dictionary} />
        </div>
      ),
    },
    {
      id: "connect",
      trigger: "top 70%",
      component: (
        <footer className="relative z-10 space-y-8 rounded-3xl border border-white/10 bg-black/60 p-10 shadow-card">
          <SectionHeading label={dictionary.contact.title} eyebrow={dictionary.contact.eyebrow} />
          <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.18em] text-neutral-400">
            {socials.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 transition-colors duration-300 hover:-translate-y-0.5 hover:border-white/40"
              >
                <span className="text-white/70 group-hover:text-white">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
            <span className="flex items-center gap-2 text-xs text-neutral-500">
              <MapPin size={16} /> {dictionary.contact.location}
            </span>
          </div>
        </footer>
      ),
    },
  ];

  const activeChapterIndex = Math.max(
    CHAPTERS.findIndex((chapter) => chapter.id === activeChapterId),
    0
  );

  const activeChapterLabel = sectionLabelMap[CHAPTERS[activeChapterIndex]?.id] ?? CHAPTERS[activeChapterIndex]?.id;

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#hero",
      start: "bottom top+=80",
      onEnter: () => setIsHeaderSolid(true),
      onLeaveBack: () => setIsHeaderSolid(false),
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <main className="bg-background text-ink">
      <ChapterIndicator
        current={activeChapterIndex + 1}
        total={CHAPTERS.length}
        label={activeChapterLabel}
      />
      <StoryProgress />

      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-all duration-300 ${
          isHeaderSolid
            ? "border-b border-white/10 bg-[#080808]/88 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-xs uppercase tracking-wider text-neutral-300 md:px-12 lg:px-20">
          <Image src="/images/logos/ts.svg" alt="TS Logo" width={40} height={40} className="h-10 w-auto brightness-0 invert" />
          <LanguageSwitcher currentLocale={lang} labels={dictionary.languageSwitcher} />
          <span className="hidden items-center gap-2 font-mono text-[13px] md:flex">
            <MapPin size={14} /> {dictionary.hero.location}
          </span>
        </div>
      </header>

      {/* Hero — full-bleed, fora do container */}
      <ChapterWrapper
        id="hero"
        start="top top"
        onEnter={setActiveChapterId}
        className="chapter-hero"
      >
        {CHAPTERS.find((c) => c.id === "hero")!.component}
      </ChapterWrapper>

      {/* Capítulos pré-Army — dentro do container */}
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-6 pb-24 md:px-12 lg:px-20">
        {CHAPTERS.filter((c) => ["about", "education"].includes(c.id)).map((chapter) => (
          <ChapterWrapper
            key={chapter.id}
            id={chapter.id}
            start={chapter.trigger}
            onEnter={setActiveChapterId}
            className={chapter.id === "about" ? "overflow-visible" : undefined}
          >
            {chapter.component}
          </ChapterWrapper>
        ))}
      </div>

      {/* Army — full-bleed */}
      <ChapterWrapper id="army" start="top top" onEnter={setActiveChapterId}>
        {CHAPTERS.find((c) => c.id === "army")!.component}
      </ChapterWrapper>

      {/* Capítulos pós-Army — dentro do container */}
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-6 pb-24 md:px-12 lg:px-20">
        {CHAPTERS.filter((c) => ["thomson", "vellum", "projects", "connect"].includes(c.id)).map((chapter) => (
          <ChapterWrapper
            key={chapter.id}
            id={chapter.id}
            start={chapter.trigger}
            onEnter={setActiveChapterId}
          >
            {chapter.component}
          </ChapterWrapper>
        ))}
      </div>
    </main>
  );
}