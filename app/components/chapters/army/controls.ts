import * as THREE from "three";
import type { ThreeState } from "./types";

let onMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
let onMouseDownHandler: ((e: MouseEvent) => void) | null = null;
let onLockChangeHandler: (() => void) | null = null;
let onOrientationHandler: ((e: DeviceOrientationEvent) => void) | null = null;
let onTouchStartHandler: ((e: TouchEvent) => void) | null = null;
let onTouchMoveHandler: ((e: TouchEvent) => void) | null = null;

const SENSITIVITY_MOUSE = 0.0018;
const SENSITIVITY_TOUCH = 0.004;
const PITCH_LIMIT = Math.PI / 2.5;

// Pré-alocação de memória para evitar Garbage Collection nos eventos
const _euler = new THREE.Euler(0, 0, 0, "YXZ");

export const lockPointer = (container: HTMLElement) => {
  const canvas = container.querySelector("canvas");
  if (canvas) canvas.requestPointerLock();
};

export const setupControls = (
  state: ThreeState,
  isMobileMode: boolean,
  container: HTMLElement,
  onShoot: () => void
) => {
  const canvas = container.querySelector("canvas");

  if (!isMobileMode) {
    onMouseMoveHandler = (e: MouseEvent) => {
      if (!state.isPointerLocked) return;
      
      state.yaw   -= e.movementX * SENSITIVITY_MOUSE;
      state.pitch -= e.movementY * SENSITIVITY_MOUSE;
      state.pitch  = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, state.pitch));
      
      // Reutiliza o Euler pré-alocado
      _euler.set(state.pitch, state.yaw, 0);
      state.camera.quaternion.setFromEuler(_euler);
    };

    onLockChangeHandler = () => {
      state.isPointerLocked = !!document.pointerLockElement;
    };

    onMouseDownHandler = (_e: MouseEvent) => {
      if (document.pointerLockElement === container || document.pointerLockElement === canvas) {
        onShoot();
      }
    };

    document.addEventListener("mousemove", onMouseMoveHandler);
    document.addEventListener("pointerlockchange", onLockChangeHandler);
    document.addEventListener("mousedown", onMouseDownHandler);
  } else {
    let baseAlpha: number | null = null;
    let lastX = 0;
    let lastY = 0;

    onOrientationHandler = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null || e.alpha === null) return;
      if (baseAlpha === null) baseAlpha = e.alpha;

      const yaw = -((e.alpha - baseAlpha) * Math.PI / 180) * 0.8;
      const pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, ((e.beta - 45) * Math.PI / 180)));
      
      _euler.set(pitch, yaw, 0);
      state.camera.quaternion.setFromEuler(_euler);
    };

    onTouchStartHandler = (e: TouchEvent) => {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    };

    onTouchMoveHandler = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - lastX;
      const dy = e.touches[0].clientY - lastY;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      
      state.yaw   -= dx * SENSITIVITY_TOUCH;
      state.pitch -= dy * SENSITIVITY_TOUCH;
      state.pitch  = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, state.pitch));
      
      _euler.set(state.pitch, state.yaw, 0);
      state.camera.quaternion.setFromEuler(_euler);
    };

    window.addEventListener("deviceorientation", onOrientationHandler);
    document.addEventListener("touchstart", onTouchStartHandler, { passive: true });
    document.addEventListener("touchmove", onTouchMoveHandler, { passive: true });
  }
};

export const cleanupControls = () => {
  if (onMouseMoveHandler) document.removeEventListener("mousemove", onMouseMoveHandler);
  if (onMouseDownHandler) document.removeEventListener("mousedown", onMouseDownHandler);
  if (onLockChangeHandler) document.removeEventListener("pointerlockchange", onLockChangeHandler);
  if (onOrientationHandler) window.removeEventListener("deviceorientation", onOrientationHandler);
  if (onTouchStartHandler) document.removeEventListener("touchstart", onTouchStartHandler);
  if (onTouchMoveHandler) document.removeEventListener("touchmove", onTouchMoveHandler);
  
  onMouseMoveHandler = onMouseDownHandler = onLockChangeHandler = onOrientationHandler = onTouchStartHandler = onTouchMoveHandler = null;
};