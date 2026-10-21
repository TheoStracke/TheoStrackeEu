import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { htmlLang, i18n, isValidLocale, ogLocale } from "@/lib/i18n";
import { CONTACT, SITE_URL } from "@/lib/site";
import { SmoothScroll } from "../components/providers/smooth-scroll";
import { Cursor } from "../components/ui/cursor";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", weight: ["400", "500"] });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["500", "700"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["500"],
});

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const dictionary = await getDictionary(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dictionary.metadata.title, template: `%s · Theo Stracke` },
    description: dictionary.metadata.description,
    icons: { icon: "/images/logos/ts.svg" },
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(i18n.locales.map((locale) => [locale, `/${locale}`])),
    },
    openGraph: {
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
      url: `${SITE_URL}/${lang}`,
      siteName: "Theo Stracke",
      locale: ogLocale[lang],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
    },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);

  // JSON-LD (Schema.org) da pessoa por trás do portfólio
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Theo Stracke",
    jobTitle: dictionary.metadata.jobTitle,
    url: SITE_URL,
    email: `mailto:${CONTACT.email}`,
    sameAs: [CONTACT.linkedin, CONTACT.github],
    worksFor: { "@type": "Organization", name: "Unna/Adeprint" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Senac SC" },
    address: { "@type": "PostalAddress", addressLocality: "Palhoça", addressRegion: "SC", addressCountry: "BR" },
  };

  return (
    <html lang={htmlLang[lang]} suppressHydrationWarning>
      <head>
        {/* marca a presença de JS antes da pintura: revelações começam ocultas sem flash */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>
          {children}
          <Cursor labels={dictionary.cursor} />
        </SmoothScroll>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
