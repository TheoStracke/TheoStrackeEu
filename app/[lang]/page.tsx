import { getDictionary } from "../../lib/getDictionary";
import { isValidLocale } from "../../lib/i18n";
import { notFound } from "next/navigation";
import { HomePage } from "../components/home-page";

interface PageProps {
  params: {
    lang: string;
  };
}
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "pt" }, { lang: "es" }];
}

export default async function LocalizedPage({ params }: PageProps) {
  if (!isValidLocale(params.lang)) {
    notFound();
  }

  const dictionary = await getDictionary(params.lang);

  return <HomePage lang={params.lang} dictionary={dictionary} />;
}
