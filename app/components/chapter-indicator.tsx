"use client";

import { motion } from "framer-motion";

interface ChapterIndicatorProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export function ChapterIndicator({
  current,
  total,
  label,
  className,
}: ChapterIndicatorProps) {
  const rootClassName = [
    "pointer-events-none fixed right-6 top-6 z-[100] hidden rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-md md:flex md:items-center md:gap-3",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} aria-live="polite" aria-label="Capitulo atual">
      <motion.span
        key={current}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/75"
      >
        {String(Math.max(current, 1)).padStart(2, "0")} / {String(Math.max(total, 1)).padStart(2, "0")}
      </motion.span>
      {label ? (
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-[180px] truncate text-[11px] uppercase tracking-[0.16em] text-neutral-500"
          title={label}
        >
          {label}
        </motion.span>
      ) : null}
    </div>
  );
}