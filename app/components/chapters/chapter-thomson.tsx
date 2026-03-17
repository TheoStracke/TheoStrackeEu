"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import type {
  ChapterThomsonProps,
  DataNode,
  DragState,
  MatrixDrop,
} from "@/types/chapter-thomson";
import { TrLogo } from "../icons/tr-logo";

type ThomsonPhase = "boot" | "matrix" | "connect" | "unlock" | "complete";

export const ChapterThomson: React.FC<ChapterThomsonProps> = ({
  dict,
  isActive,
  onComplete,
  onSkip,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const decryptTweenRef = useRef<gsap.core.Tween | null>(null);

  const [uiState, setUiState] = useState<{ phase: ThomsonPhase; text: string }>({
    phase: "boot",
    text: dict.intro,
  });

  const nodes: DataNode[] = [
    { id: "0", x: 50, y: 25 },
    { id: "1", x: 70, y: 65 },
    { id: "2", x: 30, y: 65 },
  ];

  const [connections, setConnections] = useState<string[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    activeNode: null,
    currentX: 0,
    currentY: 0,
  });

  useEffect(() => {
    if (isActive && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { filter: "brightness(0) contrast(1.2) blur(10px)" },
        { filter: "brightness(1) contrast(1) blur(0px)", duration: 1.5, ease: "power2.out" }
      );

      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 1.8, ease: "power2.out", delay: 0.3 }
        );
      }

      setUiState({ phase: "boot", text: dict.intro });
      setConnections([]);

      const timer = window.setTimeout(() => {
        setUiState({ phase: "connect", text: dict.instruction });
      }, 3000);

      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [dict.instruction, dict.intro, isActive]);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const fontSize = 16;
    let drops: MatrixDrop[] = [];
    let animationFrameId = 0;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";

    const initMatrix = () => {
      canvas.width = Math.max(1, window.innerWidth);
      canvas.height = Math.max(1, window.innerHeight);
      const columns = Math.floor(canvas.width / fontSize);
      drops = [];

      for (let i = 0; i < columns; i += 1) {
        drops.push({
          x: i * fontSize,
          y: Math.random() * -canvas.height,
          speed: 1 + Math.random() * 2,
          chars: [],
        });
      }
    };

    const drawMatrix = () => {
      ctx.fillStyle = "rgba(5, 5, 5, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = uiState.phase === "complete" ? "#333" : "#C8FF00";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i += 1) {
        const drop = drops[i];
        const text = chars.charAt(Math.floor(Math.random() * chars.length));

        ctx.fillText(text, drop.x, drop.y);

        const speedMultiplier =
          uiState.phase === "unlock" || uiState.phase === "complete" ? 0.1 : 1;
        drop.y += drop.speed * fontSize * speedMultiplier;

        if (drop.y > canvas.height && Math.random() > 0.975) {
          drop.y = 0;
        }
      }

      animationFrameId = window.requestAnimationFrame(drawMatrix);
    };

    initMatrix();
    window.addEventListener("resize", initMatrix);
    animationFrameId = window.requestAnimationFrame(drawMatrix);

    return () => {
      window.removeEventListener("resize", initMatrix);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, uiState.phase]);

  const handlePointerDown = (nodeId: string, event: React.PointerEvent) => {
    if (uiState.phase !== "connect") return;
    setDragState({ activeNode: nodeId, currentX: event.clientX, currentY: event.clientY });
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (dragState.activeNode === null) return;
    setDragState((prev) => ({ ...prev, currentX: event.clientX, currentY: event.clientY }));
  };

  const handlePointerUp = (targetNodeId?: string) => {
    if (
      dragState.activeNode !== null &&
      targetNodeId !== undefined &&
      targetNodeId !== dragState.activeNode
    ) {
      const connectionId = [dragState.activeNode, targetNodeId].sort().join("-");

      if (!connections.includes(connectionId)) {
        const newConnections = [...connections, connectionId];
        setConnections(newConnections);

        if (newConnections.length >= 3) {
          setUiState({ phase: "unlock", text: "Segure o centro para descriptografar." });

          if (logoRef.current) {
            gsap.set(".tr-dot", { opacity: 0 });
          }
        }
      }
    }

    setDragState({ activeNode: null, currentX: 0, currentY: 0 });
  };

  const handleHoldStart = () => {
    if (uiState.phase !== "unlock" || !logoRef.current) return;

    gsap.to(containerRef.current, { x: 2, y: -2, yoyo: true, repeat: -1, duration: 0.05 });

    decryptTweenRef.current = gsap.to(".tr-dot", {
      opacity: 1,
      duration: 1.5,
      stagger: 0.05,
      ease: "power1.inOut",
      onComplete: () => {
        gsap.killTweensOf(containerRef.current);
        gsap.set(containerRef.current, { x: 0, y: 0 });

        gsap.fromTo(
          containerRef.current,
          { filter: "brightness(10) contrast(2)" },
          { filter: "brightness(1) contrast(1)", duration: 0.5 }
        );

        setUiState({ phase: "complete", text: dict.complete });

        gsap.fromTo(
          ".info-card",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: "back.out(1.7)" }
        );
      },
    });
  };

  const handleHoldEnd = () => {
    if (uiState.phase !== "unlock") return;

    gsap.killTweensOf(containerRef.current);
    gsap.set(containerRef.current, { x: 0, y: 0 });

    if (decryptTweenRef.current) {
      decryptTweenRef.current.kill();
      gsap.to(".tr-dot", { opacity: 0, duration: 0.5 });
    }
  };

  const handleExit = (callback: () => void) => {
    gsap.to(containerRef.current, { opacity: 0, duration: 1, onComplete: callback });
  };

  const handleSkip = () => {
    handleExit(onSkip);
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full select-none overflow-hidden bg-[#050505]"
      onPointerMove={handlePointerMove}
      onPointerUp={() => handlePointerUp()}
      onPointerLeave={() => handlePointerUp()}
    >
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-50 bg-black"
      />

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60" />

      <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2">
        <div className="rounded-sm border border-[#C8FF00]/30 bg-black/80 px-6 py-4 backdrop-blur-sm">
          <p className="text-center font-mono text-sm uppercase tracking-widest text-[#C8FF00]">
            {uiState.text}
          </p>
        </div>
      </div>

      {(uiState.phase === "connect" || uiState.phase === "unlock") && (
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          {connections.map((connection) => {
            const [n1, n2] = connection.split("-");
            const node1 = nodes[Number(n1)];
            const node2 = nodes[Number(n2)];

            return (
              <line
                key={connection}
                x1={`${node1.x}%`}
                y1={`${node1.y}%`}
                x2={`${node2.x}%`}
                y2={`${node2.y}%`}
                stroke="#C8FF00"
                strokeWidth="2"
                className="opacity-50"
              />
            );
          })}

          {dragState.activeNode !== null && (
            <line
              x1={`${nodes[Number(dragState.activeNode)].x}%`}
              y1={`${nodes[Number(dragState.activeNode)].y}%`}
              x2={dragState.currentX}
              y2={dragState.currentY}
              stroke="#C8FF00"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}
        </svg>
      )}

      {uiState.phase === "connect" &&
        nodes.map((node) => (
          <div
            key={node.id}
            className="pointer-events-auto absolute z-20 -ml-4 -mt-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-[#C8FF00] bg-[#C8FF00]/20 transition-colors hover:bg-[#C8FF00]/50"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onPointerDown={(event) => handlePointerDown(node.id, event)}
            onPointerUp={(event) => {
              event.stopPropagation();
              handlePointerUp(node.id);
            }}
          >
            <div className="h-2 w-2 rounded-full bg-[#C8FF00]" />
          </div>
        ))}

      {uiState.phase === "unlock" && (
        <div
          className="pointer-events-auto absolute inset-0 z-30 flex cursor-pointer items-center justify-center"
          onPointerDown={handleHoldStart}
          onPointerUp={handleHoldEnd}
          onPointerLeave={handleHoldEnd}
        >
          <div className="relative h-40 w-40">
            <TrLogo className="absolute inset-0 h-full w-full animate-pulse text-[#C8FF00] opacity-20" />
            <TrLogo
              ref={logoRef}
              className="absolute inset-0 h-full w-full text-[#C8FF00] drop-shadow-[0_0_15px_rgba(200,255,0,0.8)]"
            />
          </div>
        </div>
      )}

      {uiState.phase === "complete" && (
        <div className="pointer-events-auto absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 p-10 md:flex-row">
          {[dict.cards.card1, dict.cards.card2, dict.cards.card3].map((text, index) => (
            <div
              key={`card-${index}`}
              className="info-card max-w-sm rounded-xl border border-white/10 bg-black/80 p-6 backdrop-blur-md"
            >
              <p className="font-mono text-sm leading-relaxed text-white">{text}</p>
            </div>
          ))}

          <button
            onClick={() => handleExit(onComplete)}
            className="info-card absolute bottom-20 border border-[#C8FF00] px-8 py-3 text-sm uppercase tracking-widest text-[#C8FF00] transition-colors hover:bg-[#C8FF00] hover:text-black"
            type="button"
          >
            Avancar Sistema
          </button>
        </div>
      )}

      <button
        onClick={handleSkip}
        className="pointer-events-auto absolute right-8 top-8 z-50 font-mono text-sm text-white/50 transition-colors hover:text-[#C8FF00]"
        type="button"
      >
        [ {dict.skip} ]
      </button>
    </section>
  );
};