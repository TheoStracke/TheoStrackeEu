"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";

interface SideNavSection {
  id: string;
  label: string;
}

interface SideNavProps {
  sections: SideNavSection[];
  title?: string;
}

export function SideNav({ sections, title = "Sections" }: SideNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <motion.div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="fixed left-6 top-1/2 z-[100] -translate-y-1/2"
      initial={false}
      animate={{
        width: isOpen ? 180 : 40,
        height: isOpen ? "auto" : 80,
      }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {!isOpen ? (
        // Collapsed Button
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-full border border-ink/20 bg-background/90 backdrop-blur-md shadow-lg cursor-hover">
          <Menu size={16} />
          <div className="flex flex-col gap-0.5">
            <span className="h-[2px] w-[2px] rounded-full bg-ink/40" />
            <span className="h-[2px] w-[2px] rounded-full bg-ink/40" />
            <span className="h-[2px] w-[2px] rounded-full bg-ink/40" />
          </div>
        </div>
      ) : (
        // Expanded Menu
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="h-full rounded-xl border border-ink/10 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          <div className="p-3 border-b border-ink/5">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              {title}
            </h3>
          </div>
          <nav className="p-2">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => handleClick(section.id)}
                className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-neutral-700 hover:bg-ink/5 hover:text-ink transition-colors cursor-hover"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ x: 2 }}
              >
                {section.label}
              </motion.button>
            ))}
          </nav>
        </motion.div>
      )}
    </motion.div>
  );
}
