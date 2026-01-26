import clsx from "clsx";
import { Reveal } from "./reveal";

interface SectionHeadingProps {
  label: string;
  eyebrow?: string;
  className?: string;
}

export function SectionHeading({ label, eyebrow, className }: SectionHeadingProps) {
  return (
    <div className={clsx("space-y-2", className)}>
      {eyebrow ? (
        <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">{eyebrow}</span>
      ) : null}
      <Reveal>
        <h2 className="font-display text-4xl leading-[0.95] sm:text-5xl md:text-6xl lg:text-7xl">{label}</h2>
      </Reveal>
    </div>
  );
}
