"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";

interface FeaturedProjectCardProps {
  name: string;
  description: string;
  href: string;
}

export function FeaturedProjectCard({ name, description, href }: FeaturedProjectCardProps) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 120, damping: 12 });
  const springY = useSpring(rotateY, { stiffness: 120, damping: 12 });

  const overlayOpacity = useTransform(springX, [-12, 0, 12], [0.2, 0.08, 0.2]);

  return (
    <Link href={href} target="_blank" rel="noreferrer" className="group block">
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white/60 shadow-card"
        style={{ rotateX: springY, rotateY: springX, transformStyle: "preserve-3d" }}
        onMouseMove={(event) => {
          const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateAmountX = ((y - centerY) / centerY) * -6;
          const rotateAmountY = ((x - centerX) / centerX) * 6;
          rotateX.set(rotateAmountY);
          rotateY.set(rotateAmountX);
        }}
        onMouseLeave={() => {
          rotateX.set(0);
          rotateY.set(0);
        }}
      >
        <div className="relative h-[360px] overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
          <div className="absolute inset-4 rounded-xl border border-white/80 bg-white shadow-2xl">
            <div className="absolute left-4 top-3 flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
            </div>
            <div className="absolute inset-x-4 top-11 flex h-7 items-center rounded-t-lg border border-b-0 border-neutral-200 bg-neutral-50/80 px-3">
              <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                <div className="h-3 w-3 rounded-sm bg-neutral-300" />
                <span className="max-w-[200px] truncate">despa-facil.vercel.app</span>
              </div>
            </div>
            <div className="absolute inset-x-4 bottom-4 top-[4.5rem] overflow-hidden rounded-b-lg border border-neutral-200">
              <iframe
                src="https://despa-facil.vercel.app/"
                className="h-full w-full border-0 bg-white"
                title="DespaFácil Live Preview"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/5 to-white/60 pointer-events-none"
            style={{ opacity: overlayOpacity }}
          />
        </div>
        <div className="flex items-center justify-between px-8 py-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Projeto em destaque</p>
            <h3 className="font-display text-3xl md:text-4xl">{name}</h3>
            <p className="max-w-xl text-lg text-neutral-700">{description}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-ink text-background transition-colors duration-300 group-hover:bg-accent">
            <ArrowUpRight size={24} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
