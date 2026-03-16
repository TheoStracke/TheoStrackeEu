"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const POSITION_SPRING = { damping: 28, stiffness: 280, mass: 0.5 };
const SCALE_SPRING    = { damping: 22, stiffness: 380, mass: 0.3 };

type CursorState = "default" | "interactive" | "reading" | "hidden";

export function CustomCursor() {
  const stateRef = useRef<CursorState>("default");

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const ringX  = useSpring(mouseX, POSITION_SPRING);
  const ringY  = useSpring(mouseY, POSITION_SPRING);

  const dotScaleRaw  = useMotionValue(1);
  const ringScaleRaw = useMotionValue(1);
  const ringOpacRaw  = useMotionValue(1);
  const ringBgRaw    = useMotionValue(0); 

  const dotScale  = useSpring(dotScaleRaw,  SCALE_SPRING);
  const ringScale = useSpring(ringScaleRaw, SCALE_SPRING);
  const ringOpac  = useSpring(ringOpacRaw,  SCALE_SPRING);
  const ringBg    = useTransform(ringBgRaw, [0, 1], ["rgba(255,255,255,0)", "rgba(255,255,255,0.07)"]);

  const applyState = (next: CursorState) => {
    stateRef.current = next;
    switch (next) {
      case "interactive":
        dotScaleRaw.set(0.45); ringScaleRaw.set(1.35); ringOpacRaw.set(1); ringBgRaw.set(1);
        break;
      case "reading":
        dotScaleRaw.set(1); ringScaleRaw.set(0.7); ringOpacRaw.set(0.45); ringBgRaw.set(0);
        break;
      case "hidden":
        dotScaleRaw.set(0); ringScaleRaw.set(1); ringOpacRaw.set(0); ringBgRaw.set(0);
        break;
      default:
        dotScaleRaw.set(1); ringScaleRaw.set(1); ringOpacRaw.set(1); ringBgRaw.set(0);
    }
  };

  useEffect(() => {
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        return;
      }

      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      if (document.pointerLockElement) return; // Ignora hover no modo FPS
      
      const el = e.target as HTMLElement;
      if (!el) return;

      const isInteractive = el.tagName === "A" || el.tagName === "BUTTON" || !!el.closest("a, button, [role='button']");
      const isReading = !isInteractive && (el.tagName === "P" || /^H[1-6]$/.test(el.tagName));

      applyState(isInteractive ? "interactive" : isReading ? "reading" : "default");
    };

    const onDown = () => {
      if (stateRef.current === "hidden") return;

      ringScaleRaw.set(stateRef.current === "interactive" ? 1.1 : 0.82);
      dotScaleRaw.set(0.35);
    };

    const onUp = () => {
      if (stateRef.current === "hidden") return;
      applyState(stateRef.current);
    };

    const onPointerLockChange = () => {
      if (document.pointerLockElement) {
        applyState("hidden");
      } else {
        applyState("default");
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    document.addEventListener("pointerlockchange", onPointerLockChange);

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 769px) { * { cursor: none !important; } }
        @media (max-width: 768px) { .custom-cursor { display: none !important; } }
      `}} />

      <motion.div
        className="custom-cursor fixed top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none z-[99999]"
        style={{
          x: mouseX, y: mouseY, translateX: "-50%", translateY: "-50%",
          scale: dotScale,
          backgroundColor: "white",
          mixBlendMode: "difference",
        }}
      />

      <motion.div
        className="custom-cursor fixed top-0 left-0 w-8 h-8 rounded-full border pointer-events-none z-[99998]"
        style={{
          x: ringX, y: ringY, translateX: "-50%", translateY: "-50%",
          scale: ringScale, opacity: ringOpac, backgroundColor: ringBg,
          borderColor: "white",
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}