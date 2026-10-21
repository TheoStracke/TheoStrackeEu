import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/types/dictionary";
import { Magnetic } from "./motion/magnetic";
import { FadeReveal, SplitReveal } from "./motion/reveal";

interface BriefingInviteProps {
  lang: Locale;
  dict: Pick<Dictionary["briefing"], "caseEyebrow" | "caseTitle" | "caseCta">;
}

/** Convite no fim dos cases: "Gostou? Vamos criar o seu." → página de briefing. */
export function BriefingInvite({ lang, dict }: BriefingInviteProps) {
  return (
    <section className="container-editorial py-24 md:py-32">
      <div className="flex flex-col gap-10 rounded-[clamp(1.5rem,3vw,2.5rem)] border border-line px-6 py-14 md:flex-row md:items-end md:justify-between md:px-14 md:py-20">
        <div className="flex flex-col gap-5">
          <p className="label flex items-center gap-3 text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            {dict.caseEyebrow}
          </p>
          <SplitReveal as="h2" type="lines" className="display text-[clamp(2.8rem,7vw,7rem)] text-white">
            {dict.caseTitle}
          </SplitReveal>
        </div>
        <FadeReveal>
          <Magnetic>
            <Link
              href={`/${lang}/briefing` as Route}
              transitionTypes={["nav-forward"]}
              data-cursor="open"
              className="label group flex items-center gap-4 rounded-full bg-accent py-4 pl-7 pr-5 text-background"
            >
              {dict.caseCta}
              <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
            </Link>
          </Magnetic>
        </FadeReveal>
      </div>
    </section>
  );
}
