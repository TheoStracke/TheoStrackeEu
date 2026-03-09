import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "../../lib/getDictionary";
import { i18n, isValidLocale } from "../../lib/i18n";

interface LangLayoutProps {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LangLayoutProps): Promise<Metadata> {
  if (!isValidLocale(params.lang)) {
    return {};
  }

  const dictionary = await getDictionary(params.lang);

  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
  };
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  if (!isValidLocale(params.lang)) {
    notFound();
  }

  return children;
}
