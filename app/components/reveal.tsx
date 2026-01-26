"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1], staggerChildren: 0.04 } },
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20%" }}
      transition={{ delay }}
      className={clsx("overflow-hidden", className)}
    >
      <motion.div variants={{ hidden: { y: 28, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="will-change-transform">
        {children}
      </motion.div>
    </motion.div>
  );
}
