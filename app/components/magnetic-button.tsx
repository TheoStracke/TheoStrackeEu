"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useCallback } from "react";
import clsx from "clsx";

interface MagneticButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export function MagneticButton({ href, children, className, target, rel }: MagneticButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.2 });

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      onMouseMove={(event) => {
        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        const offsetX = event.clientX - (rect.left + rect.width / 2);
        const offsetY = event.clientY - (rect.top + rect.height / 2);
        x.set(offsetX * 0.45);
        y.set(offsetY * 0.45);
      }}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <Link
        href={href}
        target={target}
        rel={rel}
        className={clsx(
          "group relative inline-flex items-center gap-3 rounded-full border border-ink px-6 py-3 text-sm uppercase tracking-[0.18em] transition-colors duration-300",
          "hover:bg-ink hover:text-background",
          className
        )}
      >
        <span className="relative z-10 font-semibold">{children}</span>
        <span className="relative z-10 h-[6px] w-[6px] rounded-full bg-ink transition-colors duration-300 group-hover:bg-background" />
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-ink opacity-0 transition-opacity duration-300"
          whileHover={{ opacity: 0.08 }}
          whileTap={{ scale: 0.98 }}
        />
      </Link>
    </motion.div>
  );
}
