"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  
  // Use motion values to avoid re-renders
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  // Ring follows with spring physics (reduced delay for closer tracking)
  const springConfig = { damping: 20, stiffness: 300, mass: 0.3 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Center the cursor elements (subtract half width/height)
      cursorX.set(e.clientX - 4); // 4px dot, center = -2px (but we use -translate-1/2)
      cursorY.set(e.clientY - 4);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over interactive elements
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.classList.contains("cursor-hover") ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".cursor-hover")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  // Detect when neural overlay is open
  useEffect(() => {
    const checkOverlay = () => {
      const isOpen = document.documentElement.hasAttribute("data-neural-overlay-open");
      setIsOverlayOpen(isOpen);
    };

    checkOverlay();
    const observer = new MutationObserver(checkOverlay);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Determine cursor colors
  const dotColor = isOverlayOpen ? "bg-white" : "bg-neutral-800";
  const ringColor = isOverlayOpen ? "border-white" : "border-neutral-800";
  const hoverBgColor = isOverlayOpen ? "rgba(255, 255, 255, 0.15)" : "rgba(38, 38, 38, 0.05)";

  return (
    <>
      {/* Dot - follows instantly */}
      <motion.div
        className={`fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[99999] ${dotColor}`}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      
      {/* Ring - follows with spring delay */}
      <motion.div
        className={`fixed top-0 left-0 w-8 h-8 border rounded-full pointer-events-none z-[99998] ${ringColor}`}
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? hoverBgColor : "transparent",
        }}
        transition={{
          scale: { duration: 0.2 },
          backgroundColor: { duration: 0.2 },
        }}
      />
    </>
  );
}
