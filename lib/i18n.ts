export const i18n = {
  defaultLocale: "pt",
  locales: ["pt", "en", "es"],
} as const;

export type Locale = (typeof i18n.locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return (i18n.locales as readonly string[]).includes(locale);
}

// Locale BCP 47 usado em <html lang> e no OpenGraph
export const htmlLang: Record<Locale, string> = { pt: "pt-BR", en: "en", es: "es" };
export const ogLocale: Record<Locale, string> = { pt: "pt_BR", en: "en_US", es: "es_ES" };
