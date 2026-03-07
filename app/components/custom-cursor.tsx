"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);

  // 1. Definição das coordenadas base (ponto central)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // 2. Definição do efeito de mola para o anel (ring)
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isClickable = !!(
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".cursor-hover") ||
        window.getComputedStyle(target).cursor === "pointer"
      );

      setIsHovering(isClickable);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Remove o cursor nativo do sistema */}
      <style dangerouslySetInnerHTML={{ __html: `
        * { cursor: none !important; }
        @media (max-width: 768px) {
          .custom-cursor-container { display: none; }
          * { cursor: auto !important; }
        }
      `}} />

      <div className="custom-cursor-container">
        {/* Dot (Ponto Central) - Segue instantaneamente */}
        <motion.div
          className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[99999]"
          style={{
            x: cursorX,
            y: cursorY,
            translateX: "-50%",
            translateY: "-50%",
            mixBlendMode: "difference",
          }}
        />

        {/* Ring (Anel Externo) - Segue com efeito de mola */}
        <motion.div
          className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[99998]"
          style={{
            x: ringX,
            y: ringY,
            translateX: "-50%",
            translateY: "-50%",
            mixBlendMode: "difference",
          }}
          animate={{
            scale: isHovering ? 1.8 : 1,
            backgroundColor: isHovering ? "rgba(255, 255, 255, 1)" : "transparent",
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300
          }}
        />
      </div>
    </>
  );
}