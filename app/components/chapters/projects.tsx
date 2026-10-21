"use client";

import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRef } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/types/dictionary";
import { FadeReveal } from "../motion/reveal";
import { ProjectList } from "../project-list";
import { useStageKeyframe } from "../stage/use-stage-keyframe";
import { ChapterHeading } from "./chapter-heading";

interface ProjectsProps {
  dict: Dictionary["projects"];
  index: string;
  lang: Locale;
}

/** Capítulo de projetos da home; a lista completa também vive em /projetos. */
export function Projects({ dict, index, lang }: ProjectsProps) {
  const ref = useRef<HTMLElement>(null);
  useStageKeyframe("projects", ref);

  return (
    <section id="projects" ref={ref} className="relative py-32 md:py-48">
      <div className="chapter-content container-editorial flex flex-col gap-16 md:gap-24">
        <ChapterHeading index={index} eyebrow={dict.eyebrow} title={dict.title} />
        <ProjectList items={dict.items} cta={dict.cta} lang={lang} />
        <FadeReveal>
          <Link
            href={`/${lang}/projetos` as Route}
            transitionTypes={["nav-forward"]}
            className="label group inline-flex items-center gap-3 text-white/70 transition-colors hover:text-white"
          >
            <span className="link-underline pb-1">{dict.viewAll}</span>
            <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
          </Link>
        </FadeReveal>
      </div>
    </section>
  );
}
