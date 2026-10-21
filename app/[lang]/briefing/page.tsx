import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Connect } from "@/app/components/chapters/connect";
import { Magnetic } from "@/app/components/motion/magnetic";
import { FadeReveal, SplitReveal } from "@/app/components/motion/reveal";
import { Header } from "@/app/components/ui/header";
import { getDictionary } from "@/lib/getDictionary";
import { i18n, isValidLocale } from "@/lib/i18n";
import { BRIEFING_FORM_URL } from "@/lib/site";
import { PAGE_TRANSITION } from "@/lib/transitions";
import type { Dictionary } from "@/types/dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/briefing">): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const { briefing } = await getDictionary(lang);
  return {
    title: briefing.metaTitle,
    description: briefing.metaDescription,
    alternates: {
      canonical: `/${lang}/briefing`,
      languages: Object.fromEntries(i18n.locales.map((locale) => [locale, `/${locale}/briefing`])),
    },
    openGraph: { title: briefing.metaTitle, description: briefing.metaDescription },
  };
}

/** Botão principal: o briefing vive no Google Forms (nova aba). */
function FormButton({ label }: { label: string }) {
  return (
    <Magnetic>
      <a
        href={BRIEFING_FORM_URL}
        target="_blank"
        rel="noreferrer"
        data-cursor="open"
        className="label group flex w-fit items-center gap-4 rounded-full bg-accent py-5 pl-8 pr-6 text-background"
      >
        {label}
        <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
      </a>
    </Magnetic>
  );
}

function Steps({ dict }: { dict: Dictionary["briefing"] }) {
  return (
    <section className="container-editorial grid gap-12 py-28 md:grid-cols-[0.7fr_1.3fr] md:gap-10 md:py-40">
      <p className="label text-muted">{dict.stepsTitle}</p>
      <FadeReveal
        as="ol"
        stagger={0.12}
        className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3"
      >
        {dict.steps.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-8 bg-background p-6 md:p-8">
            <span className="display text-6xl text-accent">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-2xl font-medium tracking-tight text-white">{step.title}</h2>
              <p className="leading-relaxed text-white/60">{step.text}</p>
            </div>
          </li>
        ))}
      </FadeReveal>
    </section>
  );
}

export default async function BriefingPage({ params }: PageProps<"/[lang]/briefing">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const d = await getDictionary(lang);
  const b = d.briefing;

  return (
    <>
      <Header
        lang={lang}
        page="briefing"
        dict={{ nav: d.nav, languageSwitcher: d.languageSwitcher, location: d.hero.location, briefing: b }}
      />

      <ViewTransition enter={PAGE_TRANSITION.enter} exit={PAGE_TRANSITION.exit} default="none">
        <main id="main">
          <section className="container-editorial flex min-h-svh flex-col justify-end gap-12 pb-16 pt-36 md:pb-24">
            <p className="label flex items-center gap-3 text-muted">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              {b.eyebrow}
            </p>
            <SplitReveal
              as="h1"
              type="chars"
              className="display max-w-[12ch] text-[clamp(3.4rem,11vw,11rem)] leading-[0.88] text-white"
            >
              {b.title}
            </SplitReveal>
            <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-[1fr_auto] md:items-end">
              <SplitReveal className="max-w-2xl text-lg leading-relaxed text-white/70 md:text-2xl md:leading-snug">
                {b.lead}
              </SplitReveal>
              <FadeReveal className="flex flex-col gap-4 md:items-end">
                <FormButton label={b.cta} />
                <p className="label text-faint">{b.note}</p>
              </FadeReveal>
            </div>
          </section>

          <Steps dict={b} />

          <section className="container-editorial grid gap-12 pb-28 md:grid-cols-[0.7fr_1.3fr] md:gap-10 md:pb-40">
            <p className="label flex flex-col gap-2 text-muted">
              {b.topicsTitle}
              <span className="text-accent">{b.questions}</span>
            </p>
            <FadeReveal as="ul" stagger={0.08} className="flex flex-col border-b border-line">
              {b.topics.map((topic, i) => (
                <li
                  key={topic}
                  className="flex items-baseline gap-6 border-t border-line py-6 text-xl text-white/85 md:text-3xl md:tracking-tight"
                >
                  <span className="label text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {topic}
                </li>
              ))}
            </FadeReveal>
          </section>

          <section className="container-editorial flex flex-col items-start gap-10 pb-32 md:pb-44">
            <SplitReveal as="h2" type="lines" className="display text-[clamp(2.8rem,7vw,7rem)] text-white">
              {b.title}
            </SplitReveal>
            <FadeReveal className="flex flex-col gap-4">
              <FormButton label={b.cta} />
              <p className="label text-faint">{b.note}</p>
            </FadeReveal>
          </section>

          <Connect dict={d.contact} index="—" />
        </main>
      </ViewTransition>
    </>
  );
}
