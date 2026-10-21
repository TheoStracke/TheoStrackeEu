import clsx from "clsx";
import { SplitReveal } from "../motion/reveal";

interface ChapterHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  className?: string;
  /** tom do texto: escuro (padrão) ou papel claro (Vellum) */
  tone?: "dark" | "paper";
  as?: "h2" | "h1";
  size?: "xl" | "md";
}

/** "03 — Acadêmico" + título display revelado por linha. */
export function ChapterHeading({
  index,
  eyebrow,
  title,
  className,
  tone = "dark",
  as = "h2",
  size = "xl",
}: ChapterHeadingProps) {
  const paper = tone === "paper";
  return (
    <div className={clsx("flex flex-col gap-5", className)}>
      <p className={clsx("label flex items-center gap-3", paper ? "text-paper-muted" : "text-muted")}>
        <span className={paper ? "text-paper-ink" : "text-accent"}>{index}</span>
        <span className={clsx("h-px w-8", paper ? "bg-paper-ink/30" : "bg-white/25")} aria-hidden="true" />
        {eyebrow}
      </p>
      <SplitReveal
        as={as}
        type="lines"
        className={clsx(
          "display",
          size === "xl" ? "text-[clamp(3rem,8.5vw,8.5rem)]" : "text-[clamp(2.5rem,5vw,4.75rem)]",
          paper ? "text-paper-ink" : "text-white",
        )}
      >
        {title}
      </SplitReveal>
    </div>
  );
}
