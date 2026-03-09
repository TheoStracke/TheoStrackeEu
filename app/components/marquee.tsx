"use client";

import clsx from "clsx";
import { CSSProperties, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface MarqueeProps {
  items: string[];
  speed?: number; // pixels per second (default: 50)
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  repeat?: number; // How many times to duplicate items (auto-calculated if not provided)
  className?: string;
  itemClassName?: string;
  gradientWidth?: string; // Width of fade gradient (default: "100px")
  gradientColor?: string; // CSS color for gradient (default: "var(--background)")
}

// ═══════════════════════════════════════════════════════════════════════════
// Marquee Component
// ═══════════════════════════════════════════════════════════════════════════

export function Marquee({
  items,
  speed = 50,
  direction = "left",
  pauseOnHover = true,
  repeat,
  className,
  itemClassName,
  gradientWidth = "100px",
  gradientColor = "hsl(var(--background))",
}: MarqueeProps) {
  // Calculate how many times to repeat items for seamless loop
  // More items = fewer repetitions needed
  const repeatCount = repeat ?? (items.length < 5 ? 4 : items.length < 10 ? 3 : 2);
  
  // Duplicate items for seamless infinite scroll
  const duplicatedItems = useMemo(() => {
    const allItems = [];
    for (let i = 0; i < repeatCount; i++) {
      allItems.push(...items);
    }
    return allItems;
  }, [items, repeatCount]);

  // Calculate animation duration based on speed
  // Slower speed = longer duration
  const itemCount = duplicatedItems.length;
  const avgItemWidth = 150; // Approximate average item width in pixels
  const totalWidth = itemCount * avgItemWidth;
  const duration = totalWidth / speed; // seconds

  // CSS custom properties for dynamic control
  const marqueeStyles: CSSProperties = {
    "--marquee-duration": `${duration}s`,
    "--marquee-direction": direction === "left" ? "normal" : "reverse",
  } as CSSProperties;

  return (
    <div
      className={clsx(
        "group relative overflow-hidden border-y border-ink/10 bg-white/50",
        className
      )}
      style={marqueeStyles}
    >
      {/* Fade gradient overlays */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10"
        style={{
          width: gradientWidth,
          background: `linear-gradient(to right, ${gradientColor}, transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10"
        style={{
          width: gradientWidth,
          background: `linear-gradient(to left, ${gradientColor}, transparent)`,
        }}
      />

      {/* Marquee track */}
      <div
        className={clsx(
          "flex whitespace-nowrap",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animation: `marquee var(--marquee-duration) linear infinite`,
          animationDirection: "var(--marquee-direction)",
        }}
      >
        {duplicatedItems.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={clsx(
              "mx-8 inline-block py-4",
              "text-lg font-medium uppercase tracking-[0.32em] text-ink/70",
              itemClassName
            )}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Keyframe animation defined inline for dynamic duration */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-${100 / repeatCount}%);
          }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Vertical Marquee Variant
// ═══════════════════════════════════════════════════════════════════════════

export interface VerticalMarqueeProps extends Omit<MarqueeProps, "direction"> {
  direction?: "up" | "down";
}

export function VerticalMarquee({
  items,
  speed = 30,
  direction = "up",
  pauseOnHover = true,
  repeat,
  className,
  itemClassName,
  gradientWidth = "80px",
  gradientColor = "hsl(var(--background))",
}: VerticalMarqueeProps) {
  const repeatCount = repeat ?? (items.length < 5 ? 4 : 3);
  
  const duplicatedItems = useMemo(() => {
    const allItems = [];
    for (let i = 0; i < repeatCount; i++) {
      allItems.push(...items);
    }
    return allItems;
  }, [items, repeatCount]);

  const itemCount = duplicatedItems.length;
  const avgItemHeight = 60;
  const totalHeight = itemCount * avgItemHeight;
  const duration = totalHeight / speed;

  const marqueeStyles: CSSProperties = {
    "--marquee-duration": `${duration}s`,
    "--marquee-direction": direction === "up" ? "normal" : "reverse",
  } as CSSProperties;

  return (
    <div
      className={clsx(
        "group relative overflow-hidden border-x border-ink/10 bg-white/50",
        className
      )}
      style={marqueeStyles}
    >
      {/* Fade gradient overlays */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{
          height: gradientWidth,
          background: `linear-gradient(to bottom, ${gradientColor}, transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: gradientWidth,
          background: `linear-gradient(to top, ${gradientColor}, transparent)`,
        }}
      />

      {/* Marquee track */}
      <div
        className={clsx(
          "flex flex-col",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animation: `marquee-vertical var(--marquee-duration) linear infinite`,
          animationDirection: "var(--marquee-direction)",
        }}
      >
        {duplicatedItems.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={clsx(
              "px-4 py-3 text-center",
              "text-sm font-medium uppercase tracking-[0.24em] text-ink/70",
              itemClassName
            )}
          >
            {item}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee-vertical {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-${100 / repeatCount}%);
          }
        }
      `}</style>
    </div>
  );
}
