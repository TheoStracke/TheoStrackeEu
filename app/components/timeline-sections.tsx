"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import { Reveal, RevealWords, StaggerContainer, StaggerItem } from "./reveal";
import { MorphingButton } from "./morphing-button";

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirrored 1:1 from the JSON schema
// ─────────────────────────────────────────────────────────────────────────────

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  details: string;        // JSON uses "details"
  skills: string[];       // JSON uses "skills"
  logo?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  type: string;           // e.g. "Undergraduate Degree" | "Technical High School"
  skills: string[];
  logo?: string;
}

interface TimelineBlock<T> {
  title: string;
  eyebrow: string;
  skillButton: string;    // "Technologies" | "Study Focus"
  items: T[];
}

export interface TimelineSectionProps {
  experience: TimelineBlock<ExperienceItem>;
  education: TimelineBlock<EducationItem>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Focus context — lifted per-group so siblings can dim
// ─────────────────────────────────────────────────────────────────────────────

const FocusCtx = createContext<{
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
}>({ focusedId: null, setFocusedId: () => {} });

const useFocus = () => useContext(FocusCtx);

// ─────────────────────────────────────────────────────────────────────────────
// Glowing Scroll Thread
// ─────────────────────────────────────────────────────────────────────────────

function ScrollThread({
  containerRef,
  nodeCount,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  nodeCount: number;
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 15%"],
  });

  const rawHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const fillHeight = useSpring(rawHeight, { stiffness: 55, damping: 20 });

  return (
    <div className="absolute left-0 top-0 bottom-0 w-[2px] pointer-events-none select-none">
      {/* Base track */}
      <div className="absolute inset-0 rounded-full bg-neutral-200/70" />

      {/* Animated fill */}
      <motion.div
        className="absolute top-0 left-0 right-0 rounded-full"
        style={{
          height: fillHeight,
          background:
            "linear-gradient(180deg, rgba(99,102,241,1) 0%, rgba(139,92,246,0.8) 55%, rgba(245,158,11,0.7) 100%)",
          boxShadow:
            "0 0 10px 2px rgba(99,102,241,0.35), 0 0 3px 0 rgba(139,92,246,0.5)",
        }}
      />

      {/* Per-node dots */}
      {Array.from({ length: nodeCount }).map((_, i) => {
        const t = nodeCount === 1 ? 0.5 : i / (nodeCount - 1);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const activated = useTransform(
          scrollYProgress,
          [Math.max(0, t - 0.08), Math.min(1, t + 0.08)],
          [0, 1]
        );
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const dotSpring = useSpring(activated, { stiffness: 220, damping: 20 });

        return (
          <motion.span
            key={i}
            className="absolute left-1/2 -translate-x-1/2 h-[10px] w-[10px] rounded-full border-2"
            style={{
              top: `${t * 100}%`,
              translateY: "-50%",
              borderColor: useTransform(
                dotSpring,
                [0, 1],
                ["rgb(212,212,212)", "rgb(99,102,241)"]
              ) as unknown as string,
              backgroundColor: useTransform(
                dotSpring,
                [0, 1],
                ["rgb(255,255,255)", "rgb(99,102,241)"]
              ) as unknown as string,
              boxShadow: useTransform(dotSpring, [0, 1], [
                "0 0 0px 0px transparent",
                "0 0 10px 3px rgba(99,102,241,0.5)",
              ]) as unknown as string,
              scale: useTransform(dotSpring, [0, 1], [0.7, 1.2]) as unknown as number,
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Magnetic Logo Tile with glare
// ─────────────────────────────────────────────────────────────────────────────

function LogoTile({ src, alt }: { src?: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOp = useMotionValue(0);

  const sX = useSpring(magX, { stiffness: 280, damping: 22 });
  const sY = useSpring(magY, { stiffness: 280, damping: 22 });
  const rotX = useTransform(sY, [-14, 14], [7, -7]);
  const rotY = useTransform(sX, [-14, 14], [-7, 7]);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 72;
    if (dist < radius) {
      const s = ((1 - dist / radius) * 14) / (dist || 1);
      magX.set(dx * s);
      magY.set(dy * s);
    }
    glareX.set(((e.clientX - r.left) / r.width) * 100);
    glareY.set(((e.clientY - r.top) / r.height) * 100);
    glareOp.set(0.38);
  }, [magX, magY, glareX, glareY, glareOp]);

  const onLeave = useCallback(() => {
    magX.set(0);
    magY.set(0);
    glareOp.set(0);
  }, [magX, magY, glareOp]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        x: sX,
        y: sY,
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center
                 overflow-hidden rounded-xl border border-white/60
                 bg-white/75 shadow-[0_2px_14px_rgba(0,0,0,0.07)]
                 backdrop-blur-md cursor-default select-none"
    >
      {/* Glare overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          opacity: glareOp,
          background: useTransform(
            [glareX, glareY],
            ([x, y]) =>
              `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`
          ),
        }}
      />
      {src ? (
        <img src={src} alt={alt} className="relative z-10 h-6 w-6 object-contain" />
      ) : (
        <span className="relative z-10 text-xs font-bold text-neutral-500">
          {alt.slice(0, 2).toUpperCase()}
        </span>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Period badge — slides + tints on focus
// ─────────────────────────────────────────────────────────────────────────────

function PeriodBadge({ period, active }: { period: string; active: boolean }) {
  return (
    <motion.span
      className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em]"
      animate={{
        x: active ? 5 : 0,
        color: active ? "rgb(99,102,241)" : "rgb(163,163,163)",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <motion.span
        className="inline-block h-px origin-left bg-current"
        animate={{ width: active ? 20 : 14, opacity: active ? 1 : 0.45 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      />
      {period}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity name — letter-spacing + animated underline
// ─────────────────────────────────────────────────────────────────────────────

function EntityName({ name, active }: { name: string; active: boolean }) {
  return (
    <span className="relative inline-block">
      <motion.span
        className="text-[13.5px] font-semibold text-neutral-800"
        animate={{ letterSpacing: active ? "0.025em" : "0em" }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
      >
        {name}
      </motion.span>
      <motion.span
        className="absolute bottom-0 left-0 h-px w-full origin-left
                   bg-gradient-to-r from-indigo-500 to-violet-400"
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mouse-tracked radial glow inside row
// ─────────────────────────────────────────────────────────────────────────────

function RowGlow({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const handler = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      mx.set(e.clientX - r.left);
      my.set(e.clientY - r.top);
    };
    parent.addEventListener("mousemove", handler);
    return () => parent.removeEventListener("mousemove", handler);
  }, [mx, my]);

  return (
    <motion.div
      ref={ref}
      className="pointer-events-none absolute inset-0 rounded-2xl"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.18 }}
      style={{
        background: useTransform(
          [mx, my],
          ([x, y]) =>
            `radial-gradient(300px circle at ${x}px ${y}px, rgba(99,102,241,0.065) 0%, transparent 70%)`
        ),
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill pill strip  (uses skillButton as the label prefix)
// ─────────────────────────────────────────────────────────────────────────────

function SkillStrip({
  skills,
  label,
  active,
}: {
  skills: string[];
  label: string;
  active: boolean;
}) {
  return (
    <motion.div
      className="mt-2.5 flex flex-wrap items-center gap-1.5"
      animate={{ opacity: active ? 1 : 0.6 }}
      transition={{ duration: 0.2 }}
    >
      <span className="mr-0.5 text-[9.5px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
        {label}
      </span>
      {skills.map((s) => (
        <span
          key={s}
          className="inline-flex items-center rounded-full border border-neutral-200/80
                     bg-neutral-50/80 px-2.5 py-[3px] text-[10px] font-medium
                     tracking-wide text-neutral-500 backdrop-blur-sm"
        >
          {s}
        </span>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Experience Row
// ─────────────────────────────────────────────────────────────────────────────

function ExperienceRow({
  item,
  id,
  skillButton,
}: {
  item: ExperienceItem;
  id: string;
  skillButton: string;
}) {
  const { focusedId, setFocusedId } = useFocus();
  const active = focusedId === id;
  const dimmed = focusedId !== null && !active;

  return (
    <motion.div
      className="relative flex gap-5 rounded-2xl p-4 -mx-4 cursor-default"
      onHoverStart={() => setFocusedId(id)}
      onHoverEnd={() => setFocusedId(null)}
      animate={{ opacity: dimmed ? 0.36 : 1, scale: dimmed ? 0.99 : 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 26 }}
    >
      <AnimatePresence>
        {active && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl border border-white/50
                       bg-white/45 shadow-[0_2px_24px_rgba(99,102,241,0.08)] backdrop-blur-[3px]"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      <RowGlow visible={active} />

      <div className="relative z-10 pt-0.5">
        <LogoTile src={item.logo} alt={item.company} />
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <EntityName name={item.company} active={active} />
          <PeriodBadge period={item.period} active={active} />
        </div>

        <motion.p
          className="text-[12.5px] font-semibold tracking-wide"
          animate={{ color: active ? "rgb(79,70,229)" : "rgb(130,130,130)" }}
          transition={{ duration: 0.18 }}
        >
          {item.role}
        </motion.p>

        <p className="text-[13px] leading-relaxed text-neutral-500">{item.details}</p>

        {item.skills.length > 0 && (
          <SkillStrip skills={item.skills} label={skillButton} active={active} />
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Education Row
// ─────────────────────────────────────────────────────────────────────────────

function EducationRow({
  item,
  id,
  skillButton,
}: {
  item: EducationItem;
  id: string;
  skillButton: string;
}) {
  const { focusedId, setFocusedId } = useFocus();
  const active = focusedId === id;
  const dimmed = focusedId !== null && !active;

  return (
    <motion.div
      className="relative flex gap-5 rounded-2xl p-4 -mx-4 cursor-default"
      onHoverStart={() => setFocusedId(id)}
      onHoverEnd={() => setFocusedId(null)}
      animate={{ opacity: dimmed ? 0.36 : 1, scale: dimmed ? 0.99 : 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 26 }}
    >
      <AnimatePresence>
        {active && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl border border-white/50
                       bg-white/45 shadow-[0_2px_24px_rgba(99,102,241,0.08)] backdrop-blur-[3px]"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      <RowGlow visible={active} />

      <div className="relative z-10 pt-0.5">
        <LogoTile src={item.logo} alt={item.institution} />
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <EntityName name={item.institution} active={active} />
          <PeriodBadge period={item.period} active={active} />
        </div>

        {/* Degree name + type badge on the same line */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <motion.p
            className="text-[12.5px] font-semibold tracking-wide"
            animate={{ color: active ? "rgb(79,70,229)" : "rgb(130,130,130)" }}
            transition={{ duration: 0.18 }}
          >
            {item.degree}
          </motion.p>
          {item.type && (
            <span
              className="rounded-full border border-neutral-200 bg-neutral-100/70
                         px-2 py-px text-[9.5px] font-medium uppercase
                         tracking-[0.18em] text-neutral-400"
            >
              {item.type}
            </span>
          )}
        </div>

        {item.skills.length > 0 && (
          <SkillStrip skills={item.skills} label={skillButton} active={active} />
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section heading
// ─────────────────────────────────────────────────────────────────────────────

function TimelineHeading({ label, eyebrow }: { label: string; eyebrow: string }) {
  return (
    <div className="mb-8 flex flex-col gap-3">
      <Reveal
        direction="left"
        distance={16}
        duration={0.6}
        viewport={{ once: true, margin: "-5%" }}
        className="overflow-visible"
        innerClassName="flex items-center gap-3"
      >
        <motion.span
          className="h-px w-8 origin-left bg-neutral-400"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
          {eyebrow}
        </span>
      </Reveal>

      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl leading-[1.15]">
        <RevealWords
          text={label}
          stagger={0.08}
          delay={0.1}
          wordClassName="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
        />
      </h2>

      <Reveal
        direction="fade"
        delay={0.35}
        duration={0.7}
        viewport={{ once: true, margin: "-5%" }}
        className="overflow-visible"
      >
        <div className="h-px bg-gradient-to-r from-neutral-200 via-neutral-300 to-transparent" />
      </Reveal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Timeline groups — each owns its own FocusCtx + ScrollThread
// ─────────────────────────────────────────────────────────────────────────────

function ExperienceGroup({ block }: { block: TimelineBlock<ExperienceItem> }) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  return (
    <FocusCtx.Provider value={{ focusedId, setFocusedId }}>
      <div ref={groupRef} className="relative">
        <TimelineHeading label={block.title} eyebrow={block.eyebrow} />
        <div className="relative pl-6">
          <ScrollThread
            containerRef={groupRef as React.RefObject<HTMLElement | null>}
            nodeCount={block.items.length}
          />
          <StaggerContainer stagger={0.12} delay={0.05} className="flex flex-col gap-1">
            {block.items.map((item, i) => {
              const id = `exp-${item.company}-${i}`;
              return (
                <StaggerItem key={id} direction="up" distance={24}>
                  <ExperienceRow item={item} id={id} skillButton={block.skillButton} />
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </FocusCtx.Provider>
  );
}

function EducationGroup({ block }: { block: TimelineBlock<EducationItem> }) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  return (
    <FocusCtx.Provider value={{ focusedId, setFocusedId }}>
      <div ref={groupRef} className="relative">
        <TimelineHeading label={block.title} eyebrow={block.eyebrow} />
        <div className="relative pl-6">
          <ScrollThread
            containerRef={groupRef as React.RefObject<HTMLElement | null>}
            nodeCount={block.items.length}
          />
          <StaggerContainer stagger={0.12} delay={0.05} className="flex flex-col gap-1">
            {block.items.map((item, i) => {
              const id = `edu-${item.institution}-${i}`;
              return (
                <StaggerItem key={id} direction="up" distance={24}>
                  <EducationRow item={item} id={id} skillButton={block.skillButton} />
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </FocusCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ambient parallax blobs
// ─────────────────────────────────────────────────────────────────────────────

function SectionAmbience({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full opacity-[0.045]"
        style={{
          y: y1,
          background: "radial-gradient(circle, rgba(99,102,241,1) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <motion.div
        className="absolute -right-24 bottom-1/4 h-[360px] w-[360px] rounded-full opacity-[0.035]"
        style={{
          y: y2,
          background: "radial-gradient(circle, rgba(245,158,11,1) 0%, transparent 70%)",
          filter: "blur(72px)",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// Usage: <TimelineSection experience={dictionary.experience} education={dictionary.education} />
// ─────────────────────────────────────────────────────────────────────────────

export function TimelineSection({ experience, education }: TimelineSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="experience" ref={sectionRef} className="relative py-24 sm:py-32">
      <SectionAmbience containerRef={sectionRef} />

      <div className="grid gap-20 lg:grid-cols-2 lg:gap-16">
        <ExperienceGroup block={experience} />
        <EducationGroup block={education} />
      </div>
    </section>
  );
}