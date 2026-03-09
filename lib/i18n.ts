export const i18n = {
  // Add new locales here (e.g. "es") and create a matching dictionary file.
  defaultLocale: "pt",
  locales: ["pt", "en", "es"],
} as const;

export const locales = [
  "en",
  "pt",
  "es"
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt";

export function isValidLocale(locale: string): locale is Locale {
  return i18n.locales.includes(locale as Locale);
}
