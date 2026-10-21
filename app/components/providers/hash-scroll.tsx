"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Chegada com âncora (ex.: /pt#projects vindo de um case). A rolagem nativa
 * acontece antes dos pins inserirem seus espaçadores, então recalculamos as
 * posições e saltamos de novo — com scroll nativo, que o Lenis acompanha
 * (o Lenis pode ainda nem existir neste momento).
 */
export function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash;
    const target = hash ? document.querySelector<HTMLElement>(hash) : null;
    if (!target) return;

    const jump = () => {
      ScrollTrigger.refresh();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    };
    const frame = requestAnimationFrame(jump);
    // imagens/fontes podem mudar alturas logo depois: um segundo ajuste fino
    const timer = window.setTimeout(jump, 400);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
