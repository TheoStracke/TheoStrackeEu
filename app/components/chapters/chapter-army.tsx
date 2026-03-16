"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { pauseForChapter, resumeFromChapter } from "../lenis-provider";
import type { ArmyGameState, ChapterArmyProps, TargetNode } from "@/types/chapter-army";

const INITIAL_TARGETS: TargetNode[] = [
  { id: "target1", x: 0.22, y: 0.34, radius: 0.08, isFound: false },
  { id: "target2", x: 0.56, y: 0.62, radius: 0.08, isFound: false },
  { id: "target3", x: 0.82, y: 0.28, radius: 0.08, isFound: false },
];

export const ChapterArmy: React.FC<ChapterArmyProps> = ({
  dict,
  isActive,
  onComplete,
  onSkip,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const requestRef = useRef<number | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);
  const completionTriggeredRef = useRef(false);
  const exitInProgressRef = useRef(false);
  const mobileHintRef = useRef<HTMLDivElement>(null);

  const gameState = useRef<ArmyGameState>({
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0,
    isMobile: false,
    isPointerLocked: false,
    isDirty: true,
    targetsFound: 0,
    targets: INITIAL_TARGETS.map((target) => ({ ...target })),
  });

  const [uiState, setUiState] = useState<{
    hasStarted: boolean;
    visibleText: string | null;
  }>({
    hasStarted: false,
    visibleText: dict.intro,
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [showMobileHint, setShowMobileHint] = useState(false);

  useEffect(() => {
    if (!showMobileHint || !mobileHintRef.current) return;

    gsap.set(mobileHintRef.current, { opacity: 1 });
    const fadeTween = gsap.to(mobileHintRef.current, {
      opacity: 0,
      duration: 0.9,
      delay: 3,
      ease: "power2.out",
      onComplete: () => setShowMobileHint(false),
    });

    return () => {
      fadeTween.kill();
    };
  }, [showMobileHint]);

  const handleExit = (callback: () => void) => {
    if (exitInProgressRef.current) return;
    exitInProgressRef.current = true;

    if (completionTimeoutRef.current !== null) {
      window.clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    if (document.pointerLockElement === canvasRef.current) {
      document.exitPointerLock();
    }

    resumeFromChapter("army");

    if (audioRef.current) {
      gsap.to(audioRef.current, {
        volume: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          audioRef.current?.pause();
          exitInProgressRef.current = false;
          callback();
        },
      });
      return;
    }

    exitInProgressRef.current = false;
    callback();
  };

  const handleStartMission = async () => {
    if (!canvasRef.current) return;

    pauseForChapter("army");

    let isMobileInput = false;

    if (audioRef.current) {
      audioRef.current.volume = 0;
      audioRef.current
        .play()
        .then(() => {
          if (!audioRef.current) return;
          gsap.to(audioRef.current, {
            volume: isMuted ? 0 : 0.4,
            duration: 2,
            ease: "power2.inOut",
          });
        })
        .catch((error) => {
          console.warn("Autoplay blocked", error);
        });
    }

    const orientationWithPermission = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    const hasGyroPermissionApi =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof orientationWithPermission.requestPermission === "function";

    if (hasGyroPermissionApi) {
      try {
        const permissionState = await orientationWithPermission.requestPermission?.();
        if (permissionState === "granted") {
          gameState.current.isMobile = true;
          isMobileInput = true;
        }
      } catch (error) {
        console.warn("Error requesting iOS gyroscope permission", error);
      }
    } else {
      const isTouchDevice =
        window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;

      if (isTouchDevice) {
        gameState.current.isMobile = true;
        isMobileInput = true;
      } else {
        try {
          canvasRef.current.requestPointerLock();
          gameState.current.isPointerLocked = true;
        } catch (error) {
          console.warn("Pointer lock denied, using touch fallback", error);
        }
      }
    }

    setIsMobileMode(isMobileInput);
    if (isMobileInput) {
      setShowMobileHint(true);
    }

    setUiState((prev) => ({ ...prev, hasStarted: true, visibleText: null }));
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    const nextMutedState = !isMuted;
    setIsMuted(nextMutedState);

    gsap.killTweensOf(audioRef.current);
    gsap.to(audioRef.current, {
      volume: nextMutedState ? 0 : 0.4,
      duration: 0.5,
      ease: "power1.inOut",
    });
  };

  useEffect(() => {
    const onPointerLockChange = () => {
      gameState.current.isPointerLocked = document.pointerLockElement === canvasRef.current;
    };

    document.addEventListener("pointerlockchange", onPointerLockChange);
    return () => {
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, []);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const targetTextById: Record<TargetNode["id"], string> = {
      target1: dict.target1,
      target2: dict.target2,
      target3: dict.target3,
    };

    const resize = () => {
      const state = gameState.current;
      state.width = Math.max(1, window.innerWidth);
      state.height = Math.max(1, window.innerHeight);
      canvas.width = state.width;
      canvas.height = state.height;

      if (!state.isPointerLocked) {
        state.mouseX = state.width / 2;
        state.mouseY = state.height / 2;
      }

      state.isDirty = true;
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;

      const state = gameState.current;
      state.mouseX += event.movementX;
      state.mouseY += event.movementY;
      state.mouseX = Math.max(0, Math.min(state.width, state.mouseX));
      state.mouseY = Math.max(0, Math.min(state.height, state.mouseY));
      state.isDirty = true;
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      const rect = canvas.getBoundingClientRect();
      const state = gameState.current;
      state.mouseX = Math.max(0, Math.min(state.width, touch.clientX - rect.left));
      state.mouseY = Math.max(0, Math.min(state.height, touch.clientY - rect.top));
      state.isDirty = true;
    };

    const onDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (document.pointerLockElement === canvas) return;
      if (event.gamma === null || event.beta === null) return;

      const state = gameState.current;
      const gamma = Math.max(-45, Math.min(45, event.gamma));
      const beta = Math.max(-45, Math.min(45, event.beta));

      state.mouseX = ((gamma + 45) / 90) * state.width;
      state.mouseY = ((beta + 45) / 90) * state.height;
      state.isDirty = true;
    };

    document.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("deviceorientation", onDeviceOrientation);

    const renderLoop = () => {
      const state = gameState.current;

      if (state.isDirty) {
        const radius = Math.max(state.width, state.height) * 0.15;

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, state.width, state.height);

        ctx.globalCompositeOperation = "destination-out";
        const gradient = ctx.createRadialGradient(
          state.mouseX,
          state.mouseY,
          0,
          state.mouseX,
          state.mouseY,
          radius
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(state.mouseX, state.mouseY, radius, 0, Math.PI * 2);
        ctx.fill();

        for (const target of state.targets) {
          if (target.isFound) continue;

          const targetAbsX = target.x * state.width;
          const targetAbsY = target.y * state.height;
          const targetAbsRadius = target.radius * Math.max(state.width, state.height);
          const dx = state.mouseX - targetAbsX;
          const dy = state.mouseY - targetAbsY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < targetAbsRadius) {
            target.isFound = true;
            state.targetsFound += 1;
            setUiState((prev) => ({
              ...prev,
              visibleText: targetTextById[target.id],
            }));

            if (state.targetsFound >= 3 && !completionTriggeredRef.current) {
              completionTriggeredRef.current = true;
              setUiState((prev) => ({ ...prev, visibleText: dict.complete }));

              completionTimeoutRef.current = window.setTimeout(() => {
                handleExit(onComplete);
              }, 3000);
            }
          }
        }

        // Feedback visual: marcadores para os alvos encontrados.
        ctx.globalCompositeOperation = "source-over";
        for (const target of state.targets) {
          if (!target.isFound) continue;

          const targetAbsX = target.x * state.width;
          const targetAbsY = target.y * state.height;

          ctx.beginPath();
          ctx.arc(targetAbsX, targetAbsY, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#C8FF00";
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#C8FF00";
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        state.isDirty = false;
      }

      requestRef.current = window.requestAnimationFrame(renderLoop);
    };

    requestRef.current = window.requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("deviceorientation", onDeviceOrientation);

      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }

      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }

      resumeFromChapter("army");

      if (audioRef.current) {
        gsap.killTweensOf(audioRef.current);
      }

      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  }, [dict, isActive, onComplete]);

  const handleSkip = () => {
    handleExit(onSkip);
  };

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-crosshair" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
        {!uiState.hasStarted && (
          <div className="pointer-events-auto text-center">
            <p className="mb-6 max-w-xl text-white/80">{uiState.visibleText}</p>
            <button
              onClick={handleStartMission}
              className="border border-[var(--accent)] px-6 py-3 text-sm uppercase tracking-[0.2em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-black"
              type="button"
            >
              Start Mission
            </button>
          </div>
        )}

        {uiState.hasStarted && uiState.visibleText && (
          <div className="absolute bottom-20 max-w-xl px-6 text-center">
            <p className="font-mono text-base text-white md:text-lg">{uiState.visibleText}</p>
          </div>
        )}

        {uiState.hasStarted && isMobileMode && showMobileHint && (
          <div
            ref={mobileHintRef}
            className="absolute bottom-10 rounded-full border border-white/20 bg-black/45 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/80"
          >
            Gire o aparelho para mover a lanterna
          </div>
        )}
      </div>

      <div className="pointer-events-auto absolute right-8 top-8 z-50 flex gap-4">
        {uiState.hasStarted && (
          <button
            onClick={toggleMute}
            className="font-mono text-sm text-white/50 transition-colors hover:text-white"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            type="button"
          >
            [ {isMuted ? "UNMUTE" : "MUTE"} ]
          </button>
        )}
        <button
          onClick={handleSkip}
          className="font-mono text-sm text-white/50 transition-colors hover:text-white"
          aria-label={dict.skip}
          type="button"
        >
          [ {dict.skip} ]
        </button>
      </div>

      <audio ref={audioRef} src="/audio/army-ambient.mp3" loop preload="none" />
    </section>
  );
};