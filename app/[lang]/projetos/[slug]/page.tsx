import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Connect } from "@/app/components/chapters/connect";
import { FadeReveal, MaskReveal, SplitReveal } from "@/app/components/motion/reveal";
import { BriefingInvite } from "@/app/components/briefing-invite";
import { Header } from "@/app/components/ui/header";
import ptDictionary from "@/dictionaries/pt.json";
import { getDictionary } from "@/lib/getDictionary";
import { i18n, isValidLocale } from "@/lib/i18n";
import { PAGE_TRANSITION } from "@/lib/transitions";

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) => ptDictionary.projects.items.map(({ slug }) => ({ lang, slug })));
}

async function loadProject(params: PageProps<"/[lang]/projetos/[slug]">["params"]) {
  const { lang, slug } = await params;
  if (!isValidLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);
  const items = dictionary.projects.items;
  const position = items.findIndex((item) => item.slug === slug);
  if (position === -1) notFound();
  return { lang, dictionary, project: items[position], position, next: items[(position + 1) % items.length] };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projetos/[slug]">): Promise<Metadata> {
  const { lang, project } = await loadProject(params);
  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: `/${lang}/projetos/${project.slug}`,
      languages: Object.fromEntries(i18n.locales.map((locale) => [locale, `/${locale}/projetos/${project.slug}`])),
    },
    openGraph: { title: project.title, description: project.summary, images: [project.gallery[0]] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/projetos/[slug]">) {
  const { lang, dictionary: d, project, position, next } = await loadProject(params);
  const labels = d.projects.labels;
  const index = String(position + 1).padStart(2, "0");

  return (
    <>
      <Header
        lang={lang}
        page="case"
        dict={{ nav: d.nav, languageSwitcher: d.languageSwitcher, location: d.hero.location, briefing: d.briefing }}
      />

      <ViewTransition enter={PAGE_TRANSITION.enter} exit={PAGE_TRANSITION.exit} default="none">
        <main id="main">
          <section className="container-editorial flex flex-col gap-12 pt-32 md:pt-44">
            <Link
              href={`/${lang}#projects` as Route}
              transitionTypes={["nav-back"]}
              className="label group flex w-fit items-center gap-3 text-muted transition-colors hover:text-white"
            >
              <ArrowLeft className="size-3.5 transition-transform duration-500 ease-expo group-hover:-translate-x-1" />
              {d.projects.back}
            </Link>

            <div className="flex flex-col gap-6">
              <p className="label flex items-center gap-3 text-muted">
                <span className="text-accent">{index}</span>
                <span className="h-px w-8 bg-white/25" aria-hidden="true" />
                {d.projects.eyebrow}
              </p>
              <SplitReveal
                as="h1"
                type="chars"
                className="display text-[clamp(3.6rem,14vw,14rem)] leading-[0.85] text-white"
              >
                {project.title}
              </SplitReveal>
            </div>

            <FadeReveal className="flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-xl text-xl text-white/70 md:text-2xl">{project.summary}</p>
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="visit"
                className="label group flex w-fit items-center gap-4 rounded-full bg-accent py-4 pl-7 pr-5 text-background"
              >
                {d.projects.visitLabel}
                <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
              </a>
            </FadeReveal>
          </section>

          <div className="container-editorial mt-14 md:mt-20">
            <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[clamp(1rem,2vw,1.75rem)] md:aspect-[16/8]">
                <Image
                  src={project.gallery[0]}
                  alt={project.title}
                  fill
                  priority
                  sizes="(min-width: 1408px) 1280px, 92vw"
                  className="object-cover object-left-top"
                />
              </div>
            </ViewTransition>
          </div>

          <section className="container-editorial grid gap-16 py-28 md:grid-cols-[0.7fr_1.3fr] md:gap-10 md:py-40">
            <p className="label text-muted">{labels.overview}</p>
            <SplitReveal className="text-2xl leading-snug text-white/85 md:text-[2.4rem] md:leading-[1.15]">
              {project.description}
            </SplitReveal>

            <p className="label text-muted">{labels.highlights}</p>
            <FadeReveal as="ol" stagger={0.1} className="flex flex-col">
              {project.highlights.map((highlight, i) => (
                <li
                  key={highlight}
                  className="flex items-baseline gap-6 border-t border-line py-6 text-lg text-white/80 md:text-xl"
                >
                  <span className="label text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {highlight}
                </li>
              ))}
            </FadeReveal>

            <p className="label text-muted">{labels.stack}</p>
            <FadeReveal as="ul" stagger={0.05} className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li key={tech} className="rounded-full border border-line px-4 py-2 text-white/75">
                  {tech}
                </li>
              ))}
            </FadeReveal>
          </section>

          <section aria-label={labels.gallery} className="container-editorial grid gap-6 md:grid-cols-2">
            {project.gallery.slice(1).map((src, i) => (
              <MaskReveal
                key={src}
                direction={i % 2 === 0 ? "up" : "down"}
                className="relative aspect-[4/3] rounded-[1.5rem]"
              >
                <Image
                  src={src}
                  alt={`${project.title} — ${labels.gallery} ${i + 2}`}
                  fill
                  sizes="(min-width: 768px) 45vw, 92vw"
                  className="object-cover object-left-top"
                />
              </MaskReveal>
            ))}
          </section>

          <section className="container-editorial py-28 md:py-40">
            <Link
              href={`/${lang}/projetos/${next.slug}` as Route}
              transitionTypes={["nav-forward"]}
              data-cursor="open"
              className="group flex flex-col gap-4 border-y border-line py-12"
            >
              <span className="label text-muted">{d.projects.next}</span>
              <span className="display flex items-center justify-between gap-6 text-[clamp(3rem,9vw,9rem)] text-white transition-colors duration-700 group-hover:text-accent">
                {next.title}
                <ArrowUpRight className="size-[0.5em] transition-transform duration-700 ease-expo group-hover:rotate-45" />
              </span>
            </Link>
          </section>

          <BriefingInvite lang={lang} dict={d.briefing} />

          <Connect dict={d.contact} index="—" />
        </main>
      </ViewTransition>
    </>
  );
}
