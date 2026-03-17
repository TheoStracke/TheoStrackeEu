"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { SectionHeading } from "@/app/components/section-heading";

// ─── D3 node/link tipos resolvidos após @types/d3 instalado ──────────────────
type SimNode = SkillNode & d3.SimulationNodeDatum;
type SimLink = Omit<SkillLink, "source" | "target"> & d3.SimulationLinkDatum<SimNode> & { projects: string[] };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkillNode {
  id: string;
  label: string;
  category: "language" | "framework" | "database" | "tooling";
}

export interface SkillLink {
  source: string;
  target: string;
  projects: string[];
}

export interface SkillsGraphDictionary {
  title: string;
  eyebrow: string;
  nodes: SkillNode[];
  links: SkillLink[];
}

interface SkillsGraphProps {
  t: SkillsGraphDictionary;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<SkillNode["category"], string> = {
  language:  "#C8FF00",   // accent — verde-limão
  framework: "#ffffff",
  database:  "#94a3b8",
  tooling:   "#64748b",
};

const CATEGORY_RADIUS: Record<SkillNode["category"], number> = {
  language:  22,
  framework: 18,
  database:  16,
  tooling:   14,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SkillsGraph({ t }: SkillsGraphProps) {
  const svgRef      = useRef<SVGSVGElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const simRef      = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const tooltipRef  = useRef<HTMLDivElement>(null);

  const draw = useCallback((width: number, height: number) => {
    if (!svgRef.current) return;

    // ── Clean up previous render
    d3.select(svgRef.current).selectAll("*").remove();
    simRef.current?.stop();

    const svg = d3.select(svgRef.current)
      .attr("width",  width)
      .attr("height", height);

    // ── Deep-clone data so D3 can mutate it
    const nodes: SimNode[] = t.nodes.map(n => ({ ...n }));
    const links: SimLink[] = t.links.map(l => ({ ...l }));

    // ── Force simulation
    const sim = d3.forceSimulation<SimNode>(nodes)
      .force("link",    d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(90).strength(0.4))
      .force("charge",  d3.forceManyBody<SimNode>().strength(-220))
      .force("center",  d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<SimNode>().radius((d) => CATEGORY_RADIUS[d.category] + 18))
      .alphaDecay(0.03);

    simRef.current = sim;

    // ── Defs — glow filter for active nodes
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // ── Link lines
    const linkGroup = svg.append("g").attr("class", "links");
    const linkEl = linkGroup.selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "rgba(255,255,255,0.08)")
      .attr("stroke-width", 1);

    // ── Node groups
    const nodeGroup = svg.append("g").attr("class", "nodes");
    const nodeEl = nodeGroup.selectAll<SVGGElement, SimNode>("g")
      .data(nodes)
      .join("g")
      .attr("class", "node-group")
      .style("cursor", "pointer");

    // outer ring (always visible, subtle)
    nodeEl.append("circle")
      .attr("r",            (d: SimNode) => CATEGORY_RADIUS[d.category] + 5)
      .attr("fill",         "none")
      .attr("stroke",       (d: SimNode) => CATEGORY_COLORS[d.category])
      .attr("stroke-width", 0.5)
      .attr("opacity",      0.2)
      .attr("class",        "ring");

    // main circle
    nodeEl.append("circle")
      .attr("r",            (d: SimNode) => CATEGORY_RADIUS[d.category])
      .attr("fill",         (d: SimNode) => d.category === "language" ? "#C8FF00" : "rgba(255,255,255,0.04)")
      .attr("stroke",       (d: SimNode) => CATEGORY_COLORS[d.category])
      .attr("stroke-width", (d: SimNode) => d.category === "language" ? 0 : 0.8)
      .attr("class",        "circle");

    // label
    nodeEl.append("text")
      .text(                (d: SimNode) => d.label)
      .attr("text-anchor",        "middle")
      .attr("dominant-baseline",  "central")
      .attr("font-size",    (d: SimNode) => d.category === "language" ? "10px" : "9px")
      .attr("font-family",        "var(--font-mono, monospace)")
      .attr("font-weight",  (d: SimNode) => d.category === "language" ? "600" : "400")
      .attr("fill",         (d: SimNode) => d.category === "language" ? "#080808" : CATEGORY_COLORS[d.category])
      .attr("pointer-events", "none")
      .attr("class", "label");

    // ── Drag behaviour
    const drag = d3.drag<SVGGElement, SimNode>()
      .on("start", (event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>, d: SimNode) => {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on("drag",  (event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>, d: SimNode) => {
        d.fx = event.x; d.fy = event.y;
      })
      .on("end",   (event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>, d: SimNode) => {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null; d.fy = null;
      });

    nodeEl.call(drag);

    // ── Hover interactions
    const tooltip = d3.select(tooltipRef.current!);

    nodeEl.on("mouseenter", function(
      this: SVGGElement,
      _event: MouseEvent,
      d: SimNode
    ) {
      const connectedIds = new Set<string>();
      connectedIds.add(d.id);
      const connectedProjects = new Set<string>();

      links.forEach(l => {
        const sid = typeof l.source === "object" ? (l.source as SimNode).id : l.source as string;
        const tid = typeof l.target === "object" ? (l.target as SimNode).id : l.target as string;
        if (sid === d.id || tid === d.id) {
          connectedIds.add(sid);
          connectedIds.add(tid);
          l.projects.forEach((p: string) => connectedProjects.add(p));
        }
      });

      // fade unconnected nodes
      nodeEl.transition().duration(200)
        .attr("opacity", (n: SimNode) => connectedIds.has(n.id) ? 1 : 0.15);

      // highlight connected links
      linkEl.transition().duration(200)
        .attr("stroke", (l: SimLink) => {
          const sid = typeof l.source === "object" ? (l.source as SimNode).id : l.source as string;
          const tid = typeof l.target === "object" ? (l.target as SimNode).id : l.target as string;
          return (sid === d.id || tid === d.id) ? "rgba(200,255,0,0.5)" : "rgba(255,255,255,0.04)";
        })
        .attr("stroke-width", (l: SimLink) => {
          const sid = typeof l.source === "object" ? (l.source as SimNode).id : l.source as string;
          const tid = typeof l.target === "object" ? (l.target as SimNode).id : l.target as string;
          return (sid === d.id || tid === d.id) ? 1.5 : 1;
        });

      // glow on active node
      d3.select<SVGGElement, SimNode>(this).select(".circle")
        .attr("filter", "url(#glow)");
      d3.select<SVGGElement, SimNode>(this).select(".ring")
        .transition().duration(200).attr("opacity", 0.6);

      // show tooltip
      const projectList = connectedProjects.size > 0
        ? [...connectedProjects].map((p: string) => `<span>${p}</span>`).join("")
        : "";

      tooltip
        .style("opacity", "1")
        .style("transform", "translateY(0px)")
        .html(`
          <div class="tt-name">${d.label}</div>
          <div class="tt-cat">${d.category}</div>
          ${projectList ? `<div class="tt-projects">${projectList}</div>` : ""}
        `);
    });

    nodeEl.on("mouseleave", function(this: SVGGElement) {
      nodeEl.transition().duration(300).attr("opacity", 1);
      linkEl.transition().duration(300)
        .attr("stroke", "rgba(255,255,255,0.08)")
        .attr("stroke-width", 1);

      d3.select<SVGGElement, SimNode>(this).select(".circle").attr("filter", null);
      d3.select<SVGGElement, SimNode>(this).select(".ring")
        .transition().duration(300).attr("opacity", 0.2);

      tooltip.style("opacity", "0").style("transform", "translateY(4px)");
    });

    // ── Touch tap (mobile)
    nodeEl.on("touchstart", function(
      this: SVGGElement,
      event: TouchEvent,
      _d: SimNode
    ) {
      event.preventDefault();
    }, { passive: false });

    // ── Tick
    sim.on("tick", () => {
      nodes.forEach((d: SimNode) => {
        d.x = Math.max(30, Math.min(width - 30, d.x ?? width / 2));
        d.y = Math.max(30, Math.min(height - 30, d.y ?? height / 2));
      });

      linkEl
        .attr("x1", (d: SimLink) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d: SimLink) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d: SimLink) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d: SimLink) => (d.target as SimNode).y ?? 0);

      nodeEl.attr("transform", (d: SimNode) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // ── Fade-in animation on first render
    svg.style("opacity", 0)
      .transition().duration(600).style("opacity", 1);

  }, [t]);

  // ── Mount & resize
  useEffect(() => {
    if (!wrapRef.current) return;

    const isMobile = () => window.innerWidth < 768;

    const getSize = () => ({
      width:  wrapRef.current!.clientWidth,
      height: isMobile() ? 340 : 480,
    });

    const { width, height } = getSize();
    draw(width, height);

    const ro = new ResizeObserver(() => {
      const s = getSize();
      draw(s.width, s.height);
    });
    ro.observe(wrapRef.current);

    return () => {
      ro.disconnect();
      simRef.current?.stop();
    };
  }, [draw]);

  // ── Reduce motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) simRef.current?.stop();
  }, []);

  return (
    <section id="skills" className="relative py-24">

      {/* Section heading */}
      <SectionHeading
        label={t.title}
        eyebrow={t.eyebrow}
        className="mb-12"
      />

      {/* Legend */}
      <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2">
        {(Object.keys(CATEGORY_COLORS) as SkillNode["category"][]).map((cat) => (
          <span key={cat} className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: CATEGORY_COLORS[cat] }}
            />
            {cat}
          </span>
        ))}
      </div>

      {/* Graph wrapper */}
      <div ref={wrapRef} className="relative w-full rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <svg ref={svgRef} className="w-full" />

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0f1115]/90 px-4 py-3 backdrop-blur-md"
          style={{
            opacity: 0,
            transform: "translateY(4px)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
            minWidth: "140px",
            textAlign: "center",
          }}
        >
          <style>{`
            .tt-name    { font-size: 13px; font-weight: 600; color: #e6e6e6; font-family: var(--font-mono, monospace); }
            .tt-cat     { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-top: 2px; }
            .tt-projects { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-top: 8px; }
            .tt-projects span {
              font-size: 10px; padding: 2px 8px; border-radius: 99px;
              background: rgba(200,255,0,0.1); color: #C8FF00;
              border: 1px solid rgba(200,255,0,0.2);
              font-family: var(--font-mono, monospace);
            }
          `}</style>
        </div>
      </div>

      {/* Hint */}
      <p className="mt-4 text-center font-mono text-[11px] text-neutral-600">
        drag nodes · hover to see connections
      </p>
    </section>
  );
}