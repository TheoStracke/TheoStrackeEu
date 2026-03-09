import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/types/dictionary";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () =>
    import("@/dictionaries/en.json").then(
      (module) => module.default as Dictionary
    ),
  pt: () =>
    import("@/dictionaries/pt.json").then(
      (module) => module.default as Dictionary
    ),
  es: () =>
    import("@/dictionaries/es.json").then(
      (module) => module.default as Dictionary
    ),
};

export const getDictionary = async (
  locale: Locale
): Promise<Dictionary> => {
  return dictionaries[locale]();
};