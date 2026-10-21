"use client";

import clsx from "clsx";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { i18n, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  current: Locale;
  label: string;
  className?: string;
}

/** Troca de idioma preservando a rota atual (/pt/projetos/x → /en/projetos/x). */
export function LanguageSwitcher({ current, label, className }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? `/${current}`;
  const rest = pathname.replace(/^\/(pt|en|es)(?=\/|$)/, "");

  return (
    <nav aria-label={label} className={clsx("flex items-center gap-1", className)}>
      {i18n.locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={`/${locale}${rest}` as Route}
            hrefLang={locale}
            aria-current={active ? "true" : undefined}
            scroll={false}
            className={clsx(
              "label rounded-full px-2.5 py-1.5 transition-colors duration-500",
              active ? "text-white" : "text-white/45 hover:text-white",
            )}
          >
            {locale}
          </Link>
        );
      })}
    </nav>
  );
}
