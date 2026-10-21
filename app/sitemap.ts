import type { MetadataRoute } from "next";
import ptDictionary from "@/dictionaries/pt.json";
import { i18n } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = (path: string) =>
    Object.fromEntries(i18n.locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`]));

  const pages = ["", "/projetos", "/briefing", ...ptDictionary.projects.items.map(({ slug }) => `/projetos/${slug}`)];

  return pages.flatMap((path) =>
    i18n.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
      alternates: { languages: languages(path) },
    })),
  );
}
