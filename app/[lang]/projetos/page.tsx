import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { BriefingInvite } from "@/app/components/briefing-invite";
import { Connect } from "@/app/components/chapters/connect";
import { FadeReveal, SplitReveal } from "@/app/components/motion/reveal";
import { ProjectList } from "@/app/components/project-list";
import { Header } from "@/app/components/ui/header";
import { getDictionary } from "@/lib/getDictionary";
import { i18n, isValidLocale } from "@/lib/i18n";
import { PAGE_TRANSITION } from "@/lib/transitions";

export async function generateMetadata({ params }: PageProps<"/[lang]/projetos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const { projects } = await getDictionary(lang);
  return {
    title: projects.title,
    description: projects.metaDescription,
    alternates: {
      canonical: `/${lang}/projetos`,
      languages: Object.fromEntries(i18n.locales.map((locale) => [locale, `/${locale}/projetos`])),
    },
    openGraph: { title: projects.title, description: projects.metaDescription, images: [projects.items[0].gallery[0]] },
  };
}

/** Página compartilhável só com os projetos — mesma lista e morph da home. */
export default async function ProjectsPage({ params }: PageProps<"/[lang]/projetos">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const d = await getDictionary(lang);
  const p = d.projects;

  return (
    <>
      <Header
        lang={lang}
        page="projects"
        dict={{ nav: d.nav, languageSwitcher: d.languageSwitcher, location: d.hero.location, briefing: d.briefing }}
      />

      <ViewTransition enter={PAGE_TRANSITION.enter} exit={PAGE_TRANSITION.exit} default="none">
        <main id="main">
          <section className="container-editorial flex flex-col gap-10 pb-16 pt-36 md:pb-24 md:pt-48">
            <p className="label flex items-center gap-3 text-muted">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              {p.eyebrow}
              <span className="tabular-nums text-accent">{String(p.items.length).padStart(2, "0")}</span>
            </p>
            <SplitReveal
              as="h1"
              type="chars"
              className="display text-[clamp(3.6rem,14vw,14rem)] leading-[0.85] text-white"
            >
              {p.title}
            </SplitReveal>
            <FadeReveal>
              <p className="max-w-2xl text-lg leading-relaxed text-white/70 md:text-2xl md:leading-snug">
                {p.pageLead}
              </p>
            </FadeReveal>
          </section>

          <section className="container-editorial">
            <ProjectList items={p.items} cta={p.cta} lang={lang} />
          </section>

          <BriefingInvite lang={lang} dict={d.briefing} />

          <Connect dict={d.contact} index="—" />
        </main>
      </ViewTransition>
    </>
  );
}
