import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from "d3-force";
import { createRandom } from "@/lib/random";
import type { SkillLink, SkillNode } from "@/types/chapter-skills";

// ═══════════════════════════════════════════════════════════════════════════
// Layout do grafo de skills calculado UMA vez, de forma determinística.
// O SVG (rótulos/arestas) e as partículas (constelação) usam as mesmas
// coordenadas, então as duas camadas se encaixam com precisão de pixel.
// ═══════════════════════════════════════════════════════════════════════════

/** Proporção largura/altura do espaço normalizado: x ∈ [-ASPECT, ASPECT], y ∈ [-1, 1]. */
export const SKILLS_ASPECT = 1.6;
const PADDING = 0.14;

export interface PlacedSkill extends SkillNode {
  x: number;
  y: number;
  degree: number;
}

interface SimNode extends SkillNode {
  x?: number;
  y?: number;
}

export function computeSkillsLayout(nodes: SkillNode[], links: SkillLink[]): PlacedSkill[] {
  const simNodes: SimNode[] = nodes.map((node) => ({ ...node }));
  const simLinks = links.map((link) => ({ source: link.source, target: link.target }));

  const simulation = forceSimulation(simNodes)
    .randomSource(createRandom(7))
    .force(
      "link",
      forceLink<SimNode, (typeof simLinks)[number]>(simLinks)
        .id((node) => node.id)
        .distance(70)
        .strength(0.6),
    )
    .force("charge", forceManyBody().strength(-420))
    .force("collide", forceCollide(42))
    .force("x", forceX(0).strength(0.04))
    .force("y", forceY(0).strength(0.07))
    .stop();

  simulation.tick(420);

  // Normaliza para caber em [-ASPECT, ASPECT] × [-1, 1] mantendo proporção
  const xs = simNodes.map((node) => node.x ?? 0);
  const ys = simNodes.map((node) => node.y ?? 0);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1e-6);
  const spanY = Math.max(maxY - minY, 1e-6);
  const fit = Math.min((2 * (SKILLS_ASPECT - PADDING)) / spanX, (2 * (1 - PADDING)) / spanY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const degree = new Map<string, number>();
  for (const link of links) {
    degree.set(link.source, (degree.get(link.source) ?? 0) + 1);
    degree.set(link.target, (degree.get(link.target) ?? 0) + 1);
  }

  // 4 casas: sub-pixel na tela e idêntico entre Node (SSR) e navegador (hidratação)
  const round = (v: number) => Math.round(v * 1e4) / 1e4;

  return simNodes.map((node) => ({
    id: node.id,
    label: node.label,
    category: node.category,
    x: round(((node.x ?? 0) - cx) * fit),
    // y do SVG cresce para baixo; no espaço normalizado, para cima
    y: round(-((node.y ?? 0) - cy) * fit),
    degree: degree.get(node.id) ?? 0,
  }));
}
