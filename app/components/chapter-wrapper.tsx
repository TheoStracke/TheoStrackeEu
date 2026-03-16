"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ScrollTrigger } from "../../lib/gsap";

interface ChapterWrapperProps {
  id: string;
  children: ReactNode;
  onEnter?: (id: string) => void;
  onLeave?: (id: string) => void;
  className?: string;
  start?: string;
  end?: string;
}

export function ChapterWrapper({
  id,
  children,
  onEnter,
  onLeave,
  className,
  start = "top center",
  end = "bottom center",
}: ChapterWrapperProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const trigger = ScrollTrigger.create({
      id: `chapter-${id}`,
      trigger: sectionRef.current,
      start,
      end,
      onEnter: () => onEnter?.(id),
      onEnterBack: () => onEnter?.(id),
      onLeave: () => onLeave?.(id),
      onLeaveBack: () => onLeave?.(id),
    });

    return () => {
      trigger.kill();
    };
  }, [id, onEnter, onLeave, start, end]);

  const sectionClassName = [
    "relative flex min-h-screen flex-col justify-center",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} ref={sectionRef} className={sectionClassName}>
      {children}
    </section>
  );
}