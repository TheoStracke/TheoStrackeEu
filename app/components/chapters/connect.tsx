"use client";

import { ArrowUp, ArrowUpRight, MapPin } from "lucide-react";
import { useRef } from "react";
import { CONTACT } from "@/lib/site";
import type { Dictionary } from "@/types/dictionary";
import { Magnetic } from "../motion/magnetic";
import { FadeReveal, SplitReveal } from "../motion/reveal";
import { useScrollTo } from "../providers/smooth-scroll";
import { useStageKeyframe } from "../stage/use-stage-keyframe";
import { GithubIcon, LinkedinIcon } from "../ui/icons";

interface ConnectProps {
  dict: Dictionary["contact"];
  index: string;
}

export function Connect({ dict, index }: ConnectProps) {
  const ref = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();
  useStageKeyframe("connect", ref);

  const socials = [
    { label: dict.linkedin, href: CONTACT.linkedin, Icon: LinkedinIcon },
    { label: dict.github, href: CONTACT.github, Icon: GithubIcon },
  ];

  return (
    <footer id="connect" ref={ref} className="relative flex min-h-svh flex-col">
      <div className="chapter-content container-editorial flex flex-1 flex-col justify-center gap-14 py-32">
        <p className="label flex items-center gap-3 text-muted">
          <span className="text-accent">{index}</span>
          <span className="h-px w-8 bg-white/25" aria-hidden="true" />
          {dict.eyebrow}
        </p>

        <SplitReveal as="h2" type="lines" className="display max-w-[14ch] text-[clamp(3.2rem,9vw,9.5rem)] text-white">
          {dict.lead}
        </SplitReveal>

        <FadeReveal className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <Magnetic strength={0.15}>
            <a
              href={`mailto:${CONTACT.email}`}
              data-cursor="open"
              className="group flex items-center gap-4 font-display text-[clamp(1.4rem,3.4vw,3rem)] font-medium tracking-tight text-white"
            >
              <span className="link-underline pb-1">{CONTACT.email}</span>
              <ArrowUpRight className="size-[0.8em] text-accent transition-transform duration-500 ease-expo group-hover:rotate-45" />
            </a>
          </Magnetic>

          <ul className="flex items-center gap-3">
            {socials.map(({ label, href, Icon }) => (
              <li key={href}>
                <Magnetic strength={0.4}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    data-cursor="visit"
                    className="flex size-14 items-center justify-center rounded-full border border-line text-white/80 transition-colors duration-500 hover:border-accent hover:text-accent"
                  >
                    <Icon className="size-5" />
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>
        </FadeReveal>
      </div>

      <div className="chapter-content container-editorial">
        <div className="label flex flex-col gap-4 border-t border-line py-8 text-faint md:flex-row md:items-center md:justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="size-3.5" aria-hidden="true" />
            {dict.location}
          </span>
          <span>
            © {new Date().getFullYear()} Theo Stracke — {dict.rights}
          </span>
          <button
            type="button"
            onClick={() => scrollTo(0, { duration: 3 })}
            className="group flex items-center gap-2 text-white/70 transition-colors hover:text-accent"
          >
            {dict.backToTop}
            <ArrowUp className="size-3.5 transition-transform duration-500 ease-expo group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
}
