import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "../../lib/getDictionary";
import { i18n, isValidLocale } from "../../lib/i18n";
import { PageTransition } from "../components/page-transition";
import { LoadingScreen } from "../components/loading-screen";


// Coloca o teu domínio real aqui para o Next.js conseguir montar as URLs absolutas
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theostracke.work";

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
    metadataBase: new URL(SITE_URL),
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
    // Configuração para o Google entender as variações de idioma (Hreflang)
    alternates: {
      canonical: `/${params.lang}`,
      languages: {
        pt: "/pt",
        en: "/en",
        es: "/es",
      },
    },
    // Open Graph: Como o teu site aparece no LinkedIn, Facebook, WhatsApp...
    openGraph: {
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
      url: `${SITE_URL}/${params.lang}`,
      siteName: "Theo Stracke Portfolio",
      locale: params.lang === "en" ? "en_US" : params.lang === "es" ? "es_ES" : "pt_BR",
      type: "website",
      images: [
        {
          url: "/og-image.png", // A imagem que vamos criar no próximo card!
          width: 1200,
          height: 630,
          alt: "Theo Stracke - Desenvolvedor de Software",
        },
      ],
    },
    // Configuração específica pro Twitter (X)
    twitter: {
      card: "summary_large_image",
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
      images: ["/og-image.png"],
    },
  };
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  if (!isValidLocale(params.lang)) {
    notFound();
  }

  // JSON-LD (Schema.org): O "RG" do teu portfólio pro Googlebot ler
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Theo Stracke",
    jobTitle: "Desenvolvedor Full Stack",
    url: SITE_URL,
    sameAs: [
      "https://linkedin.com/in/theostracke",
      "https://github.com/theostracke"
    ],
    worksFor: {
      "@type": "Organization",
      name: "Rede Vellum"
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Senac SC"
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Palhoça",
      addressRegion: "SC",
      addressCountry: "BR"
    }
  };

  return (
    <>
      {/* Injeta o script do JSON-LD na cabeça do HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LoadingScreen />
      <PageTransition>
        {children}
      </PageTransition>
    </>
  );
}