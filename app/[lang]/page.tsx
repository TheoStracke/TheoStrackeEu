import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale } from "@/lib/i18n";
import { HomePage } from "../components/home-page";

export default async function LocalizedPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);
  return <HomePage lang={lang} dictionary={dictionary} />;
}
