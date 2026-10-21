"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/media";

interface CounterProps {
  value: number;
  locale: string;
  className?: string;
}

/** Contador que sobe ao entrar na tela e zera ao sair por cima (reversível). */
export function Counter({ value, locale, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const format = (n: number) => new Intl.NumberFormat(locale).format(Math.round(n));

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;
      const state = { n: 0 };
      el.textContent = format(0);
      gsap.to(state, {
        n: value,
        duration: 2.2,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = format(state.n);
        },
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
      });
    },
    { scope: ref, dependencies: [value, locale, reduced] },
  );

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
