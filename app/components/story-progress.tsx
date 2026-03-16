"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "../../lib/gsap";

interface StoryProgressProps {
  className?: string;
}

export function StoryProgress({ className }: StoryProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: () => ScrollTrigger.maxScroll(window) || 1,
      onUpdate: (self) => setProgress(self.progress),
      invalidateOnRefresh: true,
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const rootClassName = [
    "pointer-events-none fixed right-6 top-1/2 z-[95] hidden h-56 w-[3px] -translate-y-1/2 md:block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-ink/15" />
      <div
        className="absolute bottom-0 left-0 w-full rounded-full bg-[var(--accent)]"
        style={{ height: `${Math.max(progress, 0.02) * 100}%` }}
      />
    </div>
  );
}