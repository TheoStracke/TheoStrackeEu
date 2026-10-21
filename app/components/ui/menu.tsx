"use client";

import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { CHAPTER_KEYFRAME, CHAPTERS, formatIndex } from "@/lib/chapters";
import { gsap, useGSAP } from "@/lib/gsap";
import { stage } from "@/lib/stage/store";
import type { ChapterId, Dictionary } from "@/types/dictionary";
import { useScrollLock, useScrollTo } from "../providers/smooth-scroll";

interface MenuProps {
  id: string;
  open: boolean;
  onClose: () => void;
  dict: Dictionary["nav"];
  /** no case study não há capítulos na página: links levam à home */
  homeHref: string | null;
  /** destaque comercial no fim do menu (omitido na própria página de briefing) */
  briefing: { href: string; label: string } | null;
}

/**
 * Menu em tela cheia. Abre como uma cortina (clip-path) e cada item sobe da
 * sua máscara. No hover, o palco 3D mostra a forma do capítulo — o menu
 * funciona como um índice "vivo" da narrativa.
 */
export function Menu({ id, open, onClose, dict, homeHref, briefing }: MenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const scrollTo = useScrollTo();
  useScrollLock(open);

  useGSAP(
    () => {
      const root = rootRef.current;
      const backdrop = backdropRef.current;
      if (!root || !backdrop) return;
      const layers = [backdrop, root];
      timelineRef.current = gsap
        .timeline({ paused: true, defaults: { ease: "expo.inOut" } })
        .set(layers, { visibility: "visible" })
        .fromTo(layers, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 })
        .from("[data-menu-item]", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.045 }, 0.35)
        .from("[data-menu-meta]", { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.05 }, 0.6);
    },
    { scope: rootRef },
  );

  // Abre/fecha + foco + Esc
  useEffect(() => {
    const tl = timelineRef.current;
    const root = rootRef.current;
    if (!tl || !root) return;

    // com o menu aberto o canvas sobe entre o fundo e o texto (preview 3D visível)
    document.documentElement.toggleAttribute("data-menu-open", open);
    if (open) {
      tl.timeScale(1).play();
      root.querySelector<HTMLElement>("[data-menu-link]")?.focus({ preventScroll: true });
    } else {
      tl.timeScale(1.6).reverse();
      stage.setPreview(null);
    }

    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      // trava o foco no diálogo + botão que o controla (fica no header)
      const toggle = document.querySelector<HTMLElement>(`[aria-controls="${id}"]`);
      const focusables = [toggle, ...root.querySelectorAll<HTMLElement>("[data-menu-link]")].filter(
        (el): el is HTMLElement => el !== null,
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, id]);

  const preview = (chapter: ChapterId | null) => {
    stage.setPreview(chapter ? CHAPTER_KEYFRAME[chapter] : null);
  };

  const go = (chapter: ChapterId) => {
    onClose();
    // espera o lock do scroll ser liberado antes de navegar
    requestAnimationFrame(() => scrollTo(`#${chapter}`, { duration: 2.2 }));
  };

  return (
    <>
      <div ref={backdropRef} aria-hidden="true" className="invisible fixed inset-0 z-[140] bg-background" />
      <div
        ref={rootRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={dict.menu}
        aria-hidden={!open}
        className="invisible fixed inset-0 z-[150] flex flex-col"
        onPointerLeave={() => preview(null)}
      >
        <div className="container-editorial flex flex-1 flex-col justify-center pb-8 pt-24">
          <ol className="flex flex-col gap-1 md:gap-0">
            {CHAPTERS.map((chapter, index) => {
              const label = dict.chapters[chapter];
              const linkClass = "group flex items-baseline gap-4 py-1 text-left outline-none md:gap-8";
              const content = (
                <>
                  <span className="label w-8 text-accent/80 md:w-10" data-menu-meta="">
                    {formatIndex(index)}
                  </span>
                  <span className="display block text-[min(6vw,6.2svh)] text-white/90 transition-[color,transform] duration-700 ease-expo group-hover:translate-x-4 group-hover:text-accent group-focus-visible:translate-x-4 group-focus-visible:text-accent">
                    {label}
                  </span>
                </>
              );
              return (
                <li key={chapter} className="overflow-hidden">
                  <div data-menu-item="">
                    {homeHref ? (
                      <Link
                        data-menu-link=""
                        href={`${homeHref}#${chapter}` as Route}
                        transitionTypes={["nav-back"]}
                        className={linkClass}
                        tabIndex={open ? 0 : -1}
                        onClick={onClose}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        data-menu-link=""
                        className={linkClass}
                        tabIndex={open ? 0 : -1}
                        onPointerEnter={() => preview(chapter)}
                        onFocus={() => preview(chapter)}
                        onClick={() => go(chapter)}
                      >
                        {content}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {briefing && (
            <div className="mt-6 overflow-hidden md:mt-8">
              <div data-menu-item="">
                <Link
                  data-menu-link=""
                  href={briefing.href as Route}
                  transitionTypes={["nav-forward"]}
                  tabIndex={open ? 0 : -1}
                  onClick={onClose}
                  className="label group inline-flex items-center gap-4 rounded-full bg-accent py-4 pl-7 pr-5 text-background"
                >
                  {briefing.label}
                  <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
