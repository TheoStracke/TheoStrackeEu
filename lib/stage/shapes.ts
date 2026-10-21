import { TR_LOGO, TS_LOGO, type BrandGlyph } from "@/lib/brand";
import { createRandom, gaussian } from "@/lib/random";
import { computeSkillsLayout } from "@/lib/skills-layout";
import type { SkillLink, SkillNode } from "@/types/chapter-skills";
import { SHAPES, type ShapeId } from "./layouts";

// ═══════════════════════════════════════════════════════════════════════════
// Geração das formas do palco. Cada forma é uma nuvem de `count` pontos em
// espaço normalizado (1 unidade = meia-altura do layout). Todas são empacotadas
// num único Float32Array que vira um DataArrayTexture: o shader troca de forma
// só mudando o índice da camada, sem nenhum upload por frame.
// ═══════════════════════════════════════════════════════════════════════════

type Random = () => number;
type Generator = (count: number, random: Random) => Float32Array;

export interface ShapeAtlas {
  /** lado da textura: count = side² */
  side: number;
  count: number;
  layers: number;
  /** RGBA32F por ponto, camada a camada */
  data: Float32Array;
  index: Record<ShapeId, number>;
}

export interface AtlasOptions {
  side: number;
  skills: { nodes: SkillNode[]; links: SkillLink[] };
}

const TAU = Math.PI * 2;

// ── SEÇÃO: amostragem de glifos (logos) ──────────────────────────────────────

function collectPixels(data: Uint8ClampedArray): Uint32Array {
  const hits: number[] = [];
  for (let i = 3, px = 0; i < data.length; i += 4, px += 1) {
    if (data[i] > 127) hits.push(px);
  }
  return Uint32Array.from(hits);
}

/**
 * Amostra um logo SVG em 3D: o preenchimento vira as faces frontal/traseira e
 * o contorno vira as "paredes" da extrusão — o logo tem volume quando gira.
 */
function sampleGlyph(glyph: BrandGlyph, count: number, random: Random, depth: number): Float32Array {
  const { width: vbW, height: vbH } = glyph.viewBox;
  const scale = 720 / Math.max(vbW, vbH);
  const w = Math.ceil(vbW * scale);
  const h = Math.ceil(vbH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D indisponível para amostrar o logo");

  const paths = glyph.paths.map((d) => new Path2D(d));
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = "#fff";
  paths.forEach((path) => ctx.fill(path));
  const fill = collectPixels(ctx.getImageData(0, 0, w, h).data);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.4 / scale;
  paths.forEach((path) => ctx.stroke(path));
  const edge = collectPixels(ctx.getImageData(0, 0, w, h).data);

  const out = new Float32Array(count * 3);
  const half = Math.max(w, h) / 2;

  for (let i = 0; i < count; i += 1) {
    const onEdge = edge.length > 0 && random() < 0.3;
    const pool = onEdge ? edge : fill;
    const px = pool[Math.floor(random() * pool.length)];
    const x = (px % w) + random();
    const y = Math.floor(px / w) + random();

    out[i * 3] = (x - w / 2) / half;
    out[i * 3 + 1] = -(y - h / 2) / half;
    // contorno ocupa toda a profundidade; preenchimento fica nas duas faces
    out[i * 3 + 2] = onEdge ? (random() - 0.5) * depth : (random() < 0.5 ? -0.5 : 0.5) * depth;
  }
  return out;
}

// ── SEÇÃO: ruído de Perlin 2D com semente (terreno) ──────────────────────────

function createPerlin2D(random: Random) {
  const perm = new Uint8Array(512);
  const base = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  for (let i = 0; i < 512; i += 1) perm[i] = base[i & 255];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    return (h & 1 ? -x : x) + (h & 2 ? -y : y);
  };

  return (x: number, y: number) => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[xi] + yi];
    const ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi];
    const bb = perm[perm[xi + 1] + yi + 1];
    const x1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
    const x2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
    return x1 + v * (x2 - x1);
  };
}

// ── SEÇÃO: geradores procedurais ─────────────────────────────────────────────

/** Amostragem estratificada num quadrado: distribuição uniforme sem aglomerados. */
function stratified(count: number, random: Random) {
  const side = Math.ceil(Math.sqrt(count));
  return (i: number): [number, number] => {
    const cx = i % side;
    const cy = Math.floor(i / side);
    return [((cx + random()) / side) * 2 - 1, ((cy + random()) / side) * 2 - 1];
  };
}

function randomUnit(random: Random): [number, number, number] {
  const z = random() * 2 - 1;
  const t = random() * TAU;
  const r = Math.sqrt(1 - z * z);
  return [r * Math.cos(t), r * Math.sin(t), z];
}

const orbit: Generator = (count, random) => {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const roll = random();
    let x: number;
    let y: number;
    let z: number;
    if (roll < 0.62) {
      // anel principal
      const t = random() * TAU;
      const r = 1 + gaussian(random) * 0.06;
      [x, y, z] = [Math.cos(t) * r, gaussian(random) * 0.03, Math.sin(t) * r];
    } else if (roll < 0.78) {
      // anel externo, mais fino
      const t = random() * TAU;
      const r = 1.38 + gaussian(random) * 0.015;
      [x, y, z] = [Math.cos(t) * r, gaussian(random) * 0.01, Math.sin(t) * r];
    } else {
      // poeira numa casca esférica
      const [ux, uy, uz] = randomUnit(random);
      const r = 0.45 + random() * 1.2;
      [x, y, z] = [ux * r, uy * r * 0.6, uz * r];
    }
    out.set([x, y, z], i * 3);
  }
  return out;
};

const book: Generator = (count, random) => {
  const out = new Float32Array(count * 3);
  const PAGES = 16;
  const WIDTH = 1.05;
  const HEIGHT = 0.72;
  for (let i = 0; i < count; i += 1) {
    const page = Math.floor(random() * PAGES);
    const left = page < PAGES / 2;
    const k = left ? page / (PAGES / 2) : (page - PAGES / 2) / (PAGES / 2);
    // páginas abrem em leque; duas folhas "virando" no meio
    let angle = left ? Math.PI - 0.06 - k * 0.22 : 0.06 + k * 0.22;
    if (page === PAGES / 2 - 1) angle = Math.PI * 0.68;
    if (page === PAGES / 2) angle = Math.PI * 0.42;

    const onEdge = random() < 0.24;
    const u = onEdge && random() < 0.5 ? 1 : random();
    const v = onEdge && u !== 1 ? (random() < 0.5 ? -1 : 1) : random() * 2 - 1;
    // curvatura natural do papel saindo da lombada
    const lift = Math.sin(u * Math.PI) * 0.06 + (1 - u) * (1 - u) * 0.05;

    const x = Math.cos(angle) * u * WIDTH;
    const y = Math.sin(angle) * u * WIDTH + lift;
    out.set([x, y - 0.12, v * HEIGHT], i * 3);
  }
  return out;
};

const terrain: Generator = (count, random) => {
  const out = new Float32Array(count * 3);
  const noise = createPerlin2D(random);
  const sample = stratified(count, random);
  const ridge = (x: number, z: number) => {
    let amp = 0.5;
    let freq = 1;
    let sum = 0;
    for (let o = 0; o < 4; o += 1) {
      const n = 1 - Math.abs(noise(x * freq, z * freq));
      sum += n * n * amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return sum;
  };

  for (let i = 0; i < count; i += 1) {
    // pegada circular (sem quinas): mapeia o quadrado estratificado num disco
    const [sx, sz] = sample(i);
    const r = Math.sqrt((sx + 1) / 2);
    const t = ((sz + 1) / 2) * TAU;
    const x = Math.cos(t) * r * 1.8;
    const z = Math.sin(t) * r * 1.8;
    // montanhas crescem ao fundo (z negativo) e assentam na borda do disco
    const distance = Math.min(Math.max((1.8 - z) / 3.6, 0), 1);
    const rim = 1 - Math.pow(r, 4);
    const h = ridge(x * 0.85 + 3.1, z * 0.85 - 1.7) * (0.12 + distance * distance * 0.95) * rim;
    out.set([x, h - 0.35, z], i * 3);
  }
  return out;
};

const rain: Generator = (count, random) => {
  const out = new Float32Array(count * 3);
  const COLUMNS = 40;
  const ROW = 0.042;
  for (let i = 0; i < count; i += 1) {
    const column = Math.floor(random() * COLUMNS);
    const x = ((column + 0.5) / COLUMNS) * 2 - 1;
    // y quantizado em "linhas de caractere"
    const y = Math.round((random() * 2 - 1) / ROW) * ROW;
    const layer = Math.floor(random() * 3) / 2 - 0.5;
    out.set([x * 1.75 + (random() - 0.5) * 0.008, y, layer * 0.9], i * 3);
  }
  return out;
};

const wave: Generator = (count, random) => {
  const out = new Float32Array(count * 3);
  const sample = stratified(count, random);
  for (let i = 0; i < count; i += 1) {
    const [u, v] = sample(i);
    const x = u * 1.9;
    const z = v * 0.75;
    const y = 0.22 * Math.sin(u * 2.3 + v * 0.8) + 0.08 * Math.cos(v * 3.1 + u * 1.4);
    out.set([x, y, z], i * 3);
  }
  return out;
};

const modules: Generator = (count, random) => {
  const out = new Float32Array(count * 3);
  const HEIGHTS = [0.55, 0.95, 0.4, 0.75, 1.25, 0.6, 0.45, 0.85, 0.5];
  const SIZE = 0.4;
  const STEP = 0.52;
  for (let i = 0; i < count; i += 1) {
    const box = Math.floor(random() * HEIGHTS.length);
    const cx = ((box % 3) - 1) * STEP;
    const cz = (Math.floor(box / 3) - 1) * STEP;
    const height = HEIGHTS[box];
    const half = SIZE / 2;
    let x: number;
    let y: number;
    let z: number;

    if (random() < 0.42) {
      // arestas: definem a silhueta dos módulos
      // 0–3 verticais · 4–7 ao longo de x · 8–11 ao longo de z
      const edge = Math.floor(random() * 12);
      const t = random();
      const a = edge & 1 ? half : -half;
      const b = edge & 2 ? half : -half;
      const level = edge & 1 ? height : 0;
      if (edge < 4) [x, y, z] = [a, t * height, b];
      else if (edge < 8) [x, y, z] = [(t * 2 - 1) * half, level, b];
      else [x, y, z] = [b, level, (t * 2 - 1) * half];
    } else {
      // faces laterais e topo
      const face = Math.floor(random() * 5);
      const a = (random() * 2 - 1) * half;
      const b = random();
      if (face === 0) [x, y, z] = [a, height, (random() * 2 - 1) * half];
      else if (face === 1) [x, y, z] = [half, b * height, a];
      else if (face === 2) [x, y, z] = [-half, b * height, a];
      else if (face === 3) [x, y, z] = [a, b * height, half];
      else [x, y, z] = [a, b * height, -half];
    }
    out.set([cx + x, y - 0.55, cz + z], i * 3);
  }
  return out;
};

const galaxy: Generator = (count, random) => {
  const out = new Float32Array(count * 3);
  const ARMS = 3;
  for (let i = 0; i < count; i += 1) {
    if (random() < 0.12) {
      out.set([gaussian(random) * 0.14, gaussian(random) * 0.05, gaussian(random) * 0.14], i * 3);
      continue;
    }
    const r = Math.pow(random(), 0.6) * 1.55;
    const arm = Math.floor(random() * ARMS);
    const t = r * 2.7 + (arm * TAU) / ARMS + gaussian(random) * 0.2;
    out.set([Math.cos(t) * r, gaussian(random) * 0.035 * (1.4 - r * 0.5), Math.sin(t) * r], i * 3);
  }
  return out;
};

const globe: Generator = (count, random) => {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const shell = Math.floor(count * 0.7);
  for (let i = 0; i < count; i += 1) {
    if (i < shell) {
      // esfera de Fibonacci: distribuição perfeitamente uniforme
      const y = 1 - ((i + 0.5) / shell) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      out.set([Math.cos(t) * r, y, Math.sin(t) * r], i * 3);
    } else {
      // paralelos
      const ring = Math.floor(random() * 7);
      const lat = ((ring + 1) / 8) * Math.PI - Math.PI / 2;
      const t = random() * TAU;
      const r = Math.cos(lat) * 1.04;
      out.set([Math.cos(t) * r, Math.sin(lat) * 1.04, Math.sin(t) * r], i * 3);
    }
  }
  return out;
};

function constellation(skills: AtlasOptions["skills"]): Generator {
  return (count, random) => {
    const out = new Float32Array(count * 3);
    const placed = computeSkillsLayout(skills.nodes, skills.links);
    const byId = new Map(placed.map((node) => [node.id, node]));
    const weights = placed.map((node) => 2 + node.degree);
    const total = weights.reduce((sum, w) => sum + w, 0);

    const pickNode = () => {
      let roll = random() * total;
      for (let n = 0; n < placed.length; n += 1) {
        roll -= weights[n];
        if (roll <= 0) return placed[n];
      }
      return placed[placed.length - 1];
    };

    for (let i = 0; i < count; i += 1) {
      if (random() < 0.56 || skills.links.length === 0) {
        // aglomerado em torno do nó (o "astro")
        const node = pickNode();
        const spread = 0.022 + node.degree * 0.0025;
        out.set(
          [node.x + gaussian(random) * spread, node.y + gaussian(random) * spread, gaussian(random) * 0.03],
          i * 3,
        );
      } else {
        // arestas viram filetes de partículas
        const link = skills.links[Math.floor(random() * skills.links.length)];
        const a = byId.get(link.source);
        const b = byId.get(link.target);
        if (!a || !b) continue;
        const t = random();
        const jitter = gaussian(random) * 0.004;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        out.set([a.x + dx * t - (dy / len) * jitter, a.y + dy * t + (dx / len) * jitter, 0], i * 3);
      }
    }
    return out;
  };
}

// ── SEÇÃO: ordenação e empacotamento ─────────────────────────────────────────

/**
 * Ordena os pontos por x (com leve viés de y): a partícula i ocupa regiões
 * relativas parecidas em todas as formas, então as transições "varrem" em vez
 * de explodirem em caos.
 */
function sortSweep(points: Float32Array): Float32Array {
  const count = points.length / 3;
  const order = Array.from({ length: count }, (_, i) => i);
  const key = (i: number) => points[i * 3] + points[i * 3 + 1] * 0.3;
  order.sort((a, b) => key(a) - key(b));
  const sorted = new Float32Array(points.length);
  order.forEach((from, to) => sorted.set(points.subarray(from * 3, from * 3 + 3), to * 3));
  return sorted;
}

export function buildShapeAtlas({ side, skills }: AtlasOptions): ShapeAtlas {
  const count = side * side;
  const generators: Record<ShapeId, Generator> = {
    logo: (n, random) => sampleGlyph(TS_LOGO, n, random, 0.16),
    orbit,
    book,
    terrain,
    rain,
    trLogo: (n, random) => sampleGlyph(TR_LOGO, n, random, 0.12),
    constellation: constellation(skills),
    wave,
    modules,
    galaxy,
    globe,
  };

  const data = new Float32Array(count * 4 * SHAPES.length);
  const index = {} as Record<ShapeId, number>;

  SHAPES.forEach((shape, layer) => {
    const points = sortSweep(generators[shape](count, createRandom(1009 + layer * 7919)));
    const offset = layer * count * 4;
    for (let i = 0; i < count; i += 1) {
      data[offset + i * 4] = points[i * 3];
      data[offset + i * 4 + 1] = points[i * 3 + 1];
      data[offset + i * 4 + 2] = points[i * 3 + 2];
      data[offset + i * 4 + 3] = 1;
    }
    index[shape] = layer;
  });

  return { side, count, layers: SHAPES.length, data, index };
}
