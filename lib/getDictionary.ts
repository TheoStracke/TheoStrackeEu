import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/types/dictionary";

// A paridade de schema entre os 3 idiomas é garantida em types/dictionary.ts
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  pt: () => import("@/dictionaries/pt.json").then((m) => m.default as Dictionary),
  en: () => import("@/dictionaries/en.json").then((m) => m.default as Dictionary),
  es: () => import("@/dictionaries/es.json").then((m) => m.default as Dictionary),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
