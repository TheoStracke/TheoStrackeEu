"use client";

import { motion, type Variants } from "framer-motion";
import clsx from "clsx";
import { type ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "fade";

export interface RevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  distance?: number; // Distance in pixels for directional reveals
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  once?: boolean;
  viewport?: {
    once?: boolean;
    margin?: string;
    amount?: number | "some" | "all";
  };
  blur?: boolean; // Enable blur effect during reveal
  className?: string;
  innerClassName?: string; // Additional class for inner motion.div
}

// ═══════════════════════════════════════════════════════════════════════════
// Easing Curves (Match Lenis for consistency)
// ═══════════════════════════════════════════════════════════════════════════

const easings = {
  smooth: [0.2, 0.8, 0.2, 1] as const, // Smooth cubic bezier
  snappy: [0.25, 0.1, 0.25, 1] as const, // Slightly sharper
  bounce: [0.68, -0.55, 0.265, 1.55] as const, // Subtle bounce
};

// ═══════════════════════════════════════════════════════════════════════════
// Variant Factory
// ═══════════════════════════════════════════════════════════════════════════

function createVariants(
  direction: RevealDirection,
  distance: number,
  duration: number,
  blur: boolean
): Variants {
  const baseTransition = {
    duration,
    ease: easings.smooth,
  };

  const baseHidden = {
    opacity: 0,
    ...(blur && { filter: "blur(6px)" }),
  };

  const baseVisible = {
    opacity: 1,
    ...(blur && { filter: "blur(0px)" }),
    transition: baseTransition,
  };

  switch (direction) {
    case "up":
      return {
        hidden: { ...baseHidden, y: distance },
        visible: { ...baseVisible, y: 0 },
      };

    case "down":
      return {
        hidden: { ...baseHidden, y: -distance },
        visible: { ...baseVisible, y: 0 },
      };

    case "left":
      return {
        hidden: { ...baseHidden, x: distance },
        visible: { ...baseVisible, x: 0 },
      };

    case "right":
      return {
        hidden: { ...baseHidden, x: -distance },
        visible: { ...baseVisible, x: 0 },
      };

    case "scale":
      return {
        hidden: { ...baseHidden, scale: 0.92 },
        visible: { ...baseVisible, scale: 1 },
      };

    case "fade":
    default:
      return {
        hidden: baseHidden,
        visible: baseVisible,
      };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Reveal Component
// ═══════════════════════════════════════════════════════════════════════════

export function Reveal({
  children,
  direction = "up",
  distance = 28,
  delay = 0,
  duration = 0.8,
  staggerChildren = 0.04,
  once = true,
  viewport = { once: true, margin: "-20%", amount: 0.1 },
  blur = false,
  className,
  innerClassName,
}: RevealProps) {
  const variants = createVariants(direction, distance, duration, blur);

  // Parent container variants (handles stagger)
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: viewport.once ?? once,
        margin: viewport.margin,
        amount: viewport.amount,
      }}
      className={clsx("overflow-hidden", className)}
    >
      <motion.div
        variants={variants}
        className={clsx("will-change-transform", innerClassName)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Letter Reveal (for heroic headings)
// ═══════════════════════════════════════════════════════════════════════════

export interface RevealLettersProps {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  letterClassName?: string;
}

export function RevealLetters({
  text,
  delay = 0,
  stagger = 0.03,
  className,
  letterClassName,
}: RevealLettersProps) {
  // Agora a gente separa por palavras primeiro
  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: easings.smooth,
      },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      className={clsx("inline-flex flex-wrap overflow-hidden", className)}
    >
      {words.map((word, wordIndex) => (
        <span 
          key={`word-${wordIndex}`} 
          className="inline-block whitespace-nowrap mr-[0.3em] last:mr-0"
        >
          {word.split("").map((letter, letterIndex) => (
            <motion.span
              key={`${letter}-${letterIndex}`}
              variants={letterVariants}
              className={clsx(
                "inline-block will-change-transform",
                letterClassName
              )}
            >
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Word Reveal (smoother for longer text)
// ═══════════════════════════════════════════════════════════════════════════

export interface RevealWordsProps {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  wordClassName?: string;
}

export function RevealWords({
  text,
  delay = 0,
  stagger = 0.06,
  className,
  wordClassName,
}: RevealWordsProps) {
  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easings.smooth,
      },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15%" }}
      className={clsx("inline-flex flex-wrap", className)}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-hidden mr-[0.3em]">
          <motion.span
            variants={wordVariants}
            className={clsx("inline-block will-change-transform", wordClassName)}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Stagger Container (for list items, cards, grids)
// ═══════════════════════════════════════════════════════════════════════════

export interface StaggerContainerProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  once?: boolean;
  className?: string;
}

export function StaggerContainer({
  children,
  stagger = 0.1,
  delay = 0,
  once = true,
  className,
}: StaggerContainerProps) {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10%", amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Stagger Item (must be child of StaggerContainer)
// ═══════════════════════════════════════════════════════════════════════════

export interface StaggerItemProps {
  children: ReactNode;
  direction?: RevealDirection;
  distance?: number;
  className?: string;
}

export function StaggerItem({
  children,
  direction = "up",
  distance = 24,
  className,
}: StaggerItemProps) {
  const variants = createVariants(direction, distance, 0.7, false);

  return (
    <motion.div variants={variants} className={clsx("will-change-transform", className)}>
      {children}
    </motion.div>
  );
}
