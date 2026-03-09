"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, useRef } from "react";
import clsx from "clsx";

interface InteractiveButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

const SPRING = { stiffness: 300, damping: 28, mass: 0.4 };

export function InteractiveButton({
  href,
  onClick,
  children,
  className,
  target,
  rel,
}: InteractiveButtonProps) {
  const ref = useRef<HTMLElement>(null);

  // Raw pointer position relative to button center (-0.5 → 0.5)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Soft spring — inner content only, max ±4px
  const springX = useSpring(rawX, SPRING);
  const springY = useSpring(rawY, SPRING);

  const contentX = useTransform(springX, (v) => v * 4);
  const contentY = useTransform(springY, (v) => v * 4);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      // Normalise to -0.5 → 0.5
      rawX.set((e.clientX - (rect.left + rect.width / 2)) / rect.width);
      rawY.set((e.clientY - (rect.top + rect.height / 2)) / rect.height);
    },
    [rawX, rawY]
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  const Component = onClick ? motion.button : motion.a;
  const componentProps = onClick
    ? { onClick, type: "button" as const }
    : { href, target, rel };

  return (
    <Component
      ref={ref as any}
      {...componentProps}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        y: -2,
        transition: SPRING,
      }}
      whileTap={{
        scale: 0.98,
        y: 0,
        transition: { ...SPRING, stiffness: 400 },
      }}
      className={clsx(
        // Base
        "group relative inline-flex items-center gap-3 rounded-full",
        "border border-ink px-8 py-3",
        "font-mono text-[13px] uppercase tracking-wide",
        // Hover border brightness via CSS custom property trick
        "transition-[border-color,box-shadow] duration-300 ease-out",
        "hover:border-ink/80 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12)]",
        "dark:hover:shadow-[0_4px_16px_-4px_rgba(255,255,255,0.08)]",
        "cursor-pointer",
        className
      )}
      style={{ willChange: "transform" }}
    >
      {/* Inner content shifts subtly with cursor — depth illusion, not magnetism */}
      <motion.span
        className="relative z-10 inline-flex items-center gap-3"
        style={{ x: contentX, y: contentY }}
      >
        <span className="font-medium">{children}</span>
        <span
          className={clsx(
            "h-[5px] w-[5px] rounded-full bg-ink",
            "transition-transform duration-300 group-hover:scale-110"
          )}
        />
      </motion.span>
    </Component>
  );
}