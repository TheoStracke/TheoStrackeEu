"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

interface MorphingButtonProps {
  onClick: () => void;
}

export function MorphingButton({ onClick }: MorphingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-full bg-ink border-2 border-ink shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      initial={{ width: 40, height: 40 }}
      animate={{ width: isHovered ? 100 : 40 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-center h-full px-2">
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: isHovered ? 0 : 1,
            scale: isHovered ? 0.5 : 1,
            rotate: isHovered ? 90 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Plus size={20} className="text-background" />
        </motion.div>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8,
          }}
          transition={{ duration: 0.2, delay: isHovered ? 0.1 : 0 }}
          className="text-background text-sm font-medium tracking-wide whitespace-nowrap"
        >
          Skills
        </motion.span>
      </div>
    </motion.button>
  );
}
