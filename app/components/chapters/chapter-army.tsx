"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import { pauseForChapter, resumeFromChapter } from "../lenis-provider";
import type { ChapterArmyProps } from "@/types/chapter-army";

import type { ThreeState } from "./army/types";
import { initScene, destroyScene, renderScene, updateSceneElements } from "./army/scene";
import { setupTargets, updateTargets, checkTargets } from "./army/targets";
import { setupControls, cleanupControls } from "./army/controls";

const TARGET_POSITIONS = [
  { x: -4,  z: -10 }, // Perto, à esquerda
  { x: 8,   z: -15 }, // Médio, à direita
  { x: -2,  z: -22 }, // Fundo, centralizado
];

export const ChapterArmy: React.FC<ChapterArmyProps> = ({ dict, onComplete, onSkip }) => {
  // ── REFERÊNCIAS ──
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const threeRef = useRef<ThreeState | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);
  const completionTriggered = useRef(false);
  const exitInProgress = useRef(false);

  // ── ESTADOS ──
  const [uiState, setUiState] = useState({
    hasStarted: false,
    visibleText: dict.intro as string | null,
    targetsFound: 0,
  });
  const [showTutorial, setShowTutorial] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(false);

  // ── 1. GESTÃO DE SAÍDA E CLEANUP ───────────────────────────────────────────
  const handleExit = useCallback((cb: () => void) => {
    if (exitInProgress.current) return;
    exitInProgress.current = true;

    if (threeRef.current?.animFrameId) {
      cancelAnimationFrame(threeRef.current.animFrameId);
    }

    if (completionTimeoutRef.current !== null) {
      window.clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    if (document.pointerLockElement) document.exitPointerLock();
    resumeFromChapter("army");

    const performCleanup = () => {
      if (threeRef.current) {
        destroyScene(threeRef.current, mountRef.current);
        threeRef.current = null;
      }
      cleanupControls();
      exitInProgress.current = false;
      cb();
    };

    if (audioRef.current && !audioRef.current.paused) {
      gsap.to(audioRef.current, {
        volume: 0,
        duration: 1.2,
        onComplete: () => {
          audioRef.current?.pause();
          performCleanup();
        },
      });
    } else {
      performCleanup();
    }
  }, []);

  // ── 2. LOOP DE ANIMAÇÃO ────────────────────────────────────────────────────
  const animate = useCallback(() => {
    const state = threeRef.current;
    if (!state || exitInProgress.current) return;

    updateSceneElements(state);
    updateTargets(state);

    renderScene(state);
    state.animFrameId = requestAnimationFrame(animate);
  }, []);

  const handleShoot = useCallback(() => {
    if (!threeRef.current) return;

    checkTargets(
      threeRef.current,
      (text, foundCount) => setUiState(prev => ({ ...prev, visibleText: text, targetsFound: foundCount })),
      () => {
        if (!completionTriggered.current) {
          completionTriggered.current = true;
          setTimeout(() => {
            if (exitInProgress.current) return;
            setUiState(prev => ({ ...prev, visibleText: dict.complete }));
            completionTimeoutRef.current = window.setTimeout(() => handleExit(onComplete), 3200);
          }, 1600);
        }
      }
    );
  }, [dict.complete, handleExit, onComplete]);

  // ── 3. INICIALIZAÇÃO DA MISSÃO ─────────────────────────────────────────────
  const handleStartMission = async () => {
    setShowTutorial(false);
    pauseForChapter("army");
    
    if (!mountRef.current) return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    setIsMobileMode(isTouch);

    if (!isTouch) mountRef.current.requestPointerLock();

    const state = await initScene(mountRef.current);
    threeRef.current = state;

    setupTargets(state, dict, TARGET_POSITIONS);
    setupControls(state, isTouch, mountRef.current, handleShoot);

    if (audioRef.current) {
      audioRef.current.volume = 0;
      audioRef.current.play().catch(() => {});
      gsap.to(audioRef.current, { volume: isMuted ? 0 : 0.35, duration: 2 });
    }

    setUiState(prev => ({ ...prev, hasStarted: true, visibleText: null }));
    animate();
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !isMuted;
    setIsMuted(next);
    gsap.to(audioRef.current, { volume: next ? 0 : 0.35, duration: 0.4 });
  };

  const handleSkip = () => handleExit(onSkip);

  useEffect(() => {
    return () => {
      if (threeRef.current) {
        destroyScene(threeRef.current, mountRef.current);
        threeRef.current = null;
      }
      cleanupControls();
      if (completionTimeoutRef.current) window.clearTimeout(completionTimeoutRef.current);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden bg-black ${uiState.hasStarted ? "is-playing" : ""}`}
    >
      <div ref={mountRef} className="absolute inset-0" />

      {/* TELA DE TUTORIAL / INÍCIO */}
      {!uiState.hasStarted && showTutorial && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-sm">
          <div className="max-w-lg text-center space-y-8">
            <h2 className="font-mono text-[#C8FF00] text-xl tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(200,255,0,0.5)]">
              Missão: Treinamento Theo
            </h2>
            <p className="font-mono text-white/70 text-sm leading-relaxed">
              Aqui você está interpretando o Theo no exército. <br />
              <span className="text-white">Mire nos alvos flutuantes</span> e clique para aprender mais sobre essa experiência.
            </p>
            <button
              onClick={handleStartMission}
              className="px-10 py-4 border border-[#C8FF00] text-[#C8FF00] font-mono uppercase tracking-widest hover:bg-[#C8FF00] hover:text-black transition-all duration-300"
            >
              Iniciar Treinamento
            </button>
          </div>
        </div>
      )}

      {/* HUD: Status */}
      {uiState.hasStarted && (
        <>
          <div className="pointer-events-none absolute left-8 top-8 z-20 font-mono text-xs tracking-widest text-[#C8FF00]/60">
            ALVOS: {uiState.targetsFound} / 3
          </div>
          
          {isMobileMode && (
            <div className="pointer-events-none absolute bottom-32 left-1/2 z-20 w-max -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-white/50">
              Arraste para mover a lanterna
            </div>
          )}
        </>
      )}

      {/* Legendas dos Alvos */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
        {uiState.hasStarted && uiState.visibleText && (
          <div className="absolute bottom-24 left-1/2 w-full max-w-md -translate-x-1/2 px-6 text-center">
            <p className="font-mono text-sm leading-relaxed text-white/90 md:text-base drop-shadow-md bg-black/20 backdrop-blur-sm py-2 rounded">
              {uiState.visibleText}
            </p>
          </div>
        )}
      </div>

      {/* Menu Superior Direito */}
      <div className="pointer-events-auto absolute right-8 top-8 z-50 flex gap-4">
        {uiState.hasStarted && (
          <button onClick={toggleMute} className="font-mono text-sm text-white/40 transition-colors hover:text-white/80" type="button">
            [ {isMuted ? "UNMUTE" : "MUTE"} ]
          </button>
        )}
        <button onClick={handleSkip} className="font-mono text-sm text-white/40 transition-colors hover:text-white/80" type="button">
          [ {dict.skip || "SKIP"} ]
        </button>
      </div>

      <audio ref={audioRef} src="/audio/army-ambient.mp3" loop preload="none" />
    </section>
  );
};