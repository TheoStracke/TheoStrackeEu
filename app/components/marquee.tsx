import clsx from "clsx";

interface MarqueeProps {
  items: string[];
  className?: string;
}

export function Marquee({ items, className }: MarqueeProps) {
  return (
    <div className={clsx("relative overflow-hidden border-y border-ink/10 bg-white/50", className)}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
      <div className="flex animate-marquee whitespace-nowrap text-lg font-medium uppercase tracking-[0.32em] text-ink/70">
        {[...items, ...items].map((item, index) => (
          <span key={`${item}-${index}`} className="mx-8 inline-block py-4">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
