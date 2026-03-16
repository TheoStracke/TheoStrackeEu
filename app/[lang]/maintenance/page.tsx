// app/[lang]/maintenance/page.tsx
import { isValidLocale } from "../../../lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { MaintenanceClient } from "./MaintenanceClient";

interface PageProps {
  params: { lang: string };
}

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "pt" }, { lang: "es" }];
}

export default function MaintenancePage({ params }: PageProps) {
  if (!isValidLocale(params.lang)) notFound();

  const content: Record<Locale, { title: string; desc: string; note: string }> = {
    pt: {
      title: "Em manutenção",
      desc: "Preparando uma nova versão. O sistema estará de volta em breve.",
      note: "Obrigado pela paciência.",
    },
    en: {
      title: "Under maintenance",
      desc: "A new version is being prepared. The system will be back shortly.",
      note: "Thank you for your patience.",
    },
    es: {
      title: "En mantenimiento",
      desc: "Se está preparando una nueva versión. El sistema volverá pronto.",
      note: "Gracias por tu paciencia.",
    },
  };

  return <MaintenanceClient lang={params.lang as Locale} content={content[params.lang as Locale]} />;
}