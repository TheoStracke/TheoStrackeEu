"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import ReactCountryFlag from "react-country-flag";
import type { Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  labels: {
    label: string;
    pt: string;
    en: string;
    es?: string;
  };
}

const localeOrder: Locale[] = ["pt", "en", "es"];

const COUNTRY_CODE: Record<string, string> = { pt: "BR", en: "US", es: "ES" };

export function LanguageSwitcher({ currentLocale, labels }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPathWithoutLocale = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && ["pt", "en", "es"].includes(segments[0])) {
      return segments.slice(1).join("/");
    }
    return segments.join("/");
  }, [pathname]);

  const handleSwitch = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) return;
    const base = currentPathWithoutLocale
      ? `/${nextLocale}/${currentPathWithoutLocale}`
      : `/${nextLocale}`;
    const query = searchParams.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const target = `${base}${query ? `?${query}` : ""}${hash}`;
    console.log(`[LanguageSwitcher] Language clicked: ${currentLocale} → ${nextLocale} | navigating to: ${target}`);
    router.push(target as Parameters<typeof router.push>[0]);
  };

  return (
    <div
      role="group"
      aria-label={labels.label}
      className="inline-flex items-center gap-0.5 rounded-full border border-ink/10 bg-white/80 p-1 shadow-sm backdrop-blur-md"
    >
      <span className="sr-only">{labels.label}</span>

      {localeOrder.map((locale) => {
        const isActive = locale === currentLocale;
        const localeLabel =
          locale === "pt" ? labels.pt : locale === "en" ? labels.en : labels.es ?? "ES";

        return (
          <motion.button
            key={locale}
            type="button"
            onClick={() => handleSwitch(locale)}
            aria-pressed={isActive}
            aria-label={`${labels.label}: ${localeLabel}`}
            className={clsx(
              "relative flex items-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
              // Responsive: icon-only on small screens, icon + label on md+
              "gap-0 px-2.5 py-1.5 md:gap-2 md:px-3.5 md:py-1.5",
              isActive ? "text-background" : "text-neutral-500 hover:text-ink"
            )}
            whileHover={{ scale: isActive ? 1 : 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {/* Sliding active pill — shared layoutId so it glides between buttons */}
            {isActive && (
              <motion.span
                layoutId="lang-active-pill"
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}

            {/* Flag */}
            <span className="relative z-10 leading-none">
              <ReactCountryFlag
                countryCode={COUNTRY_CODE[locale]}
                svg
                style={{ width: "1.15em", height: "1.15em", borderRadius: "3px" }}
              />
            </span>

            {/* Label — hidden on mobile, visible on md+ */}
            <span
              className={clsx(
                "relative z-10 hidden md:inline-block text-[11px] font-semibold uppercase tracking-[0.13em] leading-none select-none",
                // Keep font consistent — swap for whatever your project uses
                "font-mono"
              )}
            >
              {localeLabel}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}