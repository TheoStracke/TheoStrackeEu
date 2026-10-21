"use client";

import type { Route } from "next";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/types/dictionary";
import { Magnetic } from "../motion/magnetic";
import { useScrollTo } from "../providers/smooth-scroll";
import { TsLogo } from "./icons";
import { LanguageSwitcher } from "./language-switcher";
import { Menu } from "./menu";

const MENU_ID = "site-menu";

interface HeaderProps {
  lang: Locale;
  dict: Pick<Dictionary, "nav" | "languageSwitcher"> & {
    location: string;
    briefing: Pick<Dictionary["briefing"], "navCta" | "menuLabel">;
  };
  /** home tem capítulos na página; nas internas os links voltam para a home */
  page: "home" | "case" | "briefing";
}

/**
 * Header fixo com mix-blend-difference: continua legível sobre o fundo
 * escuro, sobre o papel claro do capítulo Vellum e sobre as partículas.
 */
export function Header({ lang, dict, page }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const scrollTo = useScrollTo();
  const close = useCallback(() => setOpen(false), []);
  const home = `/${lang}` as Route;
  const isHome = page === "home";
  const briefingHref = `/${lang}/briefing` as Route;

  return (
    <>
      <a
        href="#main"
        className="label fixed left-4 top-4 z-[300] -translate-y-20 rounded-full bg-accent px-4 py-3 text-background transition-transform focus-visible:translate-y-0"
      >
        {dict.nav.skipToContent}
      </a>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-[160] text-white mix-blend-difference">
        <div className="container-editorial flex items-center justify-between py-5 md:py-7">
          <Magnetic strength={0.25}>
            {isHome ? (
              <button
                type="button"
                aria-label={dict.nav.home}
                className="pointer-events-auto block"
                onClick={() => scrollTo(0, { duration: 2.4 })}
              >
                <TsLogo className="h-6 w-auto md:h-7" dotColor="currentColor" />
              </button>
            ) : (
              <Link
                href={home}
                aria-label={dict.nav.home}
                transitionTypes={["nav-back"]}
                className="pointer-events-auto block"
              >
                <TsLogo className="h-6 w-auto md:h-7" dotColor="currentColor" />
              </Link>
            )}
          </Magnetic>

          <span className="label hidden text-white/60 lg:block">{dict.location}</span>

          <div className="pointer-events-auto flex items-center gap-3 md:gap-6">
            <LanguageSwitcher current={lang} label={dict.languageSwitcher.label} className="hidden sm:flex" />
            {page !== "briefing" && (
              <Link
                href={briefingHref}
                transitionTypes={["nav-forward"]}
                className="label hidden rounded-full bg-white px-4 py-2.5 text-black transition-opacity duration-500 hover:opacity-80 md:block"
              >
                {dict.briefing.navCta}
              </Link>
            )}
            <Magnetic strength={0.3}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={MENU_ID}
                onClick={() => setOpen((value) => !value)}
                className="label group flex items-center gap-3 rounded-full border border-white/30 px-4 py-2.5 transition-colors duration-500 hover:border-white"
              >
                <span className="relative block h-2 w-4" aria-hidden="true">
                  <span
                    className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ease-expo ${open ? "translate-y-1 rotate-45" : ""}`}
                  />
                  <span
                    className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ease-expo ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
                  />
                </span>
                {open ? dict.nav.close : dict.nav.menu}
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      <Menu
        id={MENU_ID}
        open={open}
        onClose={close}
        dict={dict.nav}
        homeHref={isHome ? null : home}
        briefing={page === "briefing" ? null : { href: briefingHref, label: dict.briefing.menuLabel }}
      />
      {/* idiomas também ficam acessíveis no mobile, dentro do menu aberto */}
      {open && (
        <div className="fixed inset-x-0 bottom-6 z-[160] flex justify-center sm:hidden">
          <LanguageSwitcher current={lang} label={dict.languageSwitcher.label} />
        </div>
      )}
    </>
  );
}
