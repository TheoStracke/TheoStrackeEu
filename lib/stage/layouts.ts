// ═══════════════════════════════════════════════════════════════════════════
// Coreografia do palco: cada keyframe diz QUAL forma as partículas assumem e
// ONDE/COMO ela aparece. Os capítulos só registram "quando" (posição de
// scroll); o "como" mora aqui, num lugar só.
// ═══════════════════════════════════════════════════════════════════════════

export const SHAPES = [
  "logo",
  "orbit",
  "book",
  "terrain",
  "rain",
  "trLogo",
  "constellation",
  "wave",
  "modules",
  "galaxy",
  "globe",
] as const;

export type ShapeId = (typeof SHAPES)[number];

export interface StageLayout {
  shape: ShapeId;
  /** deslocamento do centro em frações do viewport (-0.5 … 0.5) */
  x: number;
  y: number;
  /** 1 unidade da forma = scale × meia-altura do viewport */
  scale: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  color: string;
  accent: string;
  /** fração das partículas pintadas com o accent */
  accentMix: number;
  size: number;
  opacity: number;
  /** ruído idle */
  noise: number;
  /** queda contínua (chuva Matrix) */
  flow: number;
  /** ondulação de superfície */
  wave: number;
  /** rotação contínua em rad/s */
  spin: number;
  /** neblina por profundidade */
  fog: number;
  /** lanterna seguindo o cursor */
  spot: number;
}

const INK = "#e6e6e6";
const ACCENT = "#ff3131";
const PAPER_INK = "#1a1a17";

const BASE: Omit<StageLayout, "shape"> = {
  x: 0,
  y: 0,
  scale: 0.5,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  color: INK,
  accent: ACCENT,
  accentMix: 0.12,
  size: 2.2,
  opacity: 0.9,
  noise: 0.012,
  flow: 0,
  wave: 0,
  spin: 0,
  fog: 0,
  spot: 0,
};

const layout = (shape: ShapeId, overrides: Partial<StageLayout> = {}): StageLayout => ({
  ...BASE,
  shape,
  ...overrides,
});

export const KEYFRAMES = {
  hero: layout("logo", { x: 0.3, y: 0.28, scale: 0.3, accentMix: 0.06, size: 2.4 }),
  about: layout("orbit", { x: 0.22, scale: 0.75, rotX: 1.15, rotZ: -0.25, spin: 0.08, opacity: 0.7 }),
  education: layout("book", { x: -0.22, y: -0.2, scale: 0.62, rotX: -0.75, rotY: 0.35, opacity: 0.75 }),
  army: layout("terrain", {
    y: -0.12,
    scale: 0.62,
    rotX: 0.38,
    color: "#c9c2bd",
    accentMix: 0.04,
    size: 2.6,
    opacity: 1,
    wave: 0.35,
    fog: 0.5,
    spot: 0.6,
  }),
  "thomson-rain": layout("rain", { scale: 1.05, accentMix: 0.85, size: 2.8, flow: 1, opacity: 1 }),
  "thomson-logo": layout("trLogo", { x: 0.27, y: 0.1, scale: 0.48, accentMix: 0.35, size: 2.3, noise: 0.006 }),
  skills: layout("constellation", { scale: 0.7, accentMix: 0.18, size: 2, opacity: 0.85, noise: 0.006 }),
  vellum: layout("wave", {
    x: 0.08,
    y: -0.2,
    scale: 0.7,
    rotX: 0.55,
    color: PAPER_INK,
    accent: "#b3261e",
    accentMix: 0.1,
    size: 2.1,
    opacity: 0.65,
    wave: 1,
  }),
  unna: layout("modules", { x: 0.2, y: -0.02, scale: 0.5, rotX: 0.62, rotY: -0.78, accentMix: 0.22, spin: 0.05 }),
  projects: layout("galaxy", { x: 0.1, scale: 1, rotX: 1.05, spin: 0.04, opacity: 0.35, accentMix: 0.1 }),
  connect: layout("globe", { x: 0.22, y: 0.04, scale: 0.62, rotX: 0.35, spin: 0.1, accentMix: 0.25 }),
} satisfies Record<string, StageLayout>;

export type KeyframeId = keyof typeof KEYFRAMES;

/** Versão centralizada de cada forma, usada no preview do menu. */
export function previewLayout(id: KeyframeId): StageLayout {
  const base = KEYFRAMES[id];
  return { ...base, x: 0.18, y: 0, scale: Math.min(base.scale, 0.65), opacity: Math.min(base.opacity, 0.7) };
}
