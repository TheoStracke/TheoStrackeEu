import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FadeReveal, SplitReveal } from "@/app/components/motion/reveal";
import { LanguageSwitcher } from "@/app/components/ui/language-switcher";
import { TsLogo } from "@/app/components/ui/icons";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/maintenance">): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const { maintenance } = await getDictionary(lang);
  return { title: maintenance.title, robots: { index: false } };
}

export default async function MaintenancePage({ params }: PageProps<"/[lang]/maintenance">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const { maintenance, languageSwitcher } = await getDictionary(lang);

  return (
    <main className="container-editorial flex min-h-svh flex-col justify-between py-10">
      <TsLogo className="h-8 w-auto self-start text-white" />

      <div className="flex flex-col gap-8">
        <p className="label flex items-center gap-3 text-accent">
          <span
            className="size-1.5 rounded-full bg-accent [animation:pulse-dot_2.4s_ease-in-out_infinite]"
            aria-hidden="true"
          />
          {maintenance.note}
        </p>
        <SplitReveal as="h1" type="chars" className="display text-[clamp(3.4rem,12vw,12rem)] text-white">
          {maintenance.title}
        </SplitReveal>
        <FadeReveal>
          <p className="max-w-xl text-xl text-white/65">{maintenance.description}</p>
        </FadeReveal>
      </div>

      <LanguageSwitcher current={lang} label={languageSwitcher.label} />
    </main>
  );
}
