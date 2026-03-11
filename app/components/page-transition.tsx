"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Remove o prefixo /lang para isolar o "caminho de conteúdo" real */
function stripLang(pathname: string): string {
  return pathname.replace(/^\/(pt|en|es)(?=\/|$)/, "") || "/";
}

// ─── Variantes ────────────────────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, filter: "blur(5px)", y: 15  },
  animate: { opacity: 1, filter: "blur(0px)", y: 0   },
  exit:    { opacity: 0, filter: "blur(5px)", y: -15 },
};

const langVariants = {
  initial: { opacity: 0, filter: "blur(8px)"  },
  animate: { opacity: 1, filter: "blur(0px)"  },
  exit:    { opacity: 0, filter: "blur(8px)"  },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function PageTransition({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang?: string;
}) {
  const pathname = usePathname() ?? "";

  /**
   * useRef → escrita SÍNCRONA durante o render.
   * Armazena o snapshot do ciclo anterior sem disparar re-render.
   *
   * Problema do código original:
   *   useEffect + cleanup roda DEPOIS do próximo render,
   *   então isLangChangeOnly era sempre calculado 1 frame atrasado.
   */
  const prevRef = useRef<{ pathname: string; contentPath: string } | null>(null);

  const currentContentPath = stripLang(pathname);

  // Classificar a transição com os dados do ciclo anterior (síncronos)
  let isLangChangeOnly = false;

  if (prevRef.current !== null) {
    const contentPathSame = prevRef.current.contentPath === currentContentPath;
    const pathnameDiff    = prevRef.current.pathname    !== pathname;
    isLangChangeOnly = contentPathSame && pathnameDiff;
  }

  // Atualizar snapshot para o PRÓXIMO render (síncrono, sem useEffect)
  prevRef.current = { pathname, contentPath: currentContentPath };

  const variants   = isLangChangeOnly ? langVariants  : pageVariants;
  const transition = isLangChangeOnly
    ? { duration: 0.4,  ease: "easeInOut"              }
    : { duration: 0.5,  ease: [0.25, 0.1, 0.25, 1] as const };

  return (
    /**
     * Wrapper com overflow:hidden + minHeight evita o layout shift
     * durante o gap do mode="wait" (entre exit concluir e o enter começar).
     * isolation:isolate impede o blur de vazar para navbar/overlays.
     */
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100dvh",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <AnimatePresence
        mode="wait" // exit 100% completo antes do enter começar
      >
        <motion.div
          key={pathname}  // pathname completo como key → detecta lang E rota
          className="w-full h-full"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          style={{ willChange: "opacity, filter" }} // promove para GPU layer
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}