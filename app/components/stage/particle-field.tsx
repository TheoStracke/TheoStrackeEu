"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DataArrayTexture,
  FloatType,
  GLSL3,
  NearestFilter,
  NormalBlending,
  RGBAFormat,
  ShaderMaterial,
  Vector3,
  type Group,
  type Points,
} from "three";
import { createRandom } from "@/lib/random";
import { previewLayout, type KeyframeId, type ShapeId, type StageLayout } from "@/lib/stage/layouts";
import { particleFragmentShader, particleVertexShader } from "@/lib/stage/shaders";
import type { ShapeAtlas } from "@/lib/stage/shapes";
import { stage } from "@/lib/stage/store";

// ── SEÇÃO: utilidades de interpolação ────────────────────────────────────────

type RGB = [number, number, number];
const colorCache = new Map<string, RGB>();

function hexToRgb(hex: string): RGB {
  let rgb = colorCache.get(hex);
  if (!rgb) {
    const value = Number.parseInt(hex.slice(1), 16);
    rgb = [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
    colorCache.set(hex, rgb);
  }
  return rgb;
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Amortecimento independente de FPS. */
const damp = (current: number, target: number, rate: number, delta: number) =>
  lerp(current, target, 1 - Math.exp(-rate * delta));

/** Layout numérico mutável (cores já em RGB) — evita alocar a cada frame. */
interface Blended {
  x: number;
  y: number;
  scale: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  color: RGB;
  accent: RGB;
  accentMix: number;
  size: number;
  opacity: number;
  noise: number;
  flow: number;
  wave: number;
  spin: number;
  fog: number;
  spot: number;
}

const NUMERIC_KEYS = [
  "x",
  "y",
  "scale",
  "rotX",
  "rotY",
  "rotZ",
  "accentMix",
  "size",
  "opacity",
  "noise",
  "flow",
  "wave",
  "spin",
  "fog",
  "spot",
] as const;

function createBlended(): Blended {
  return {
    x: 0,
    y: 0,
    scale: 1,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    color: [1, 1, 1],
    accent: [1, 1, 1],
    accentMix: 0,
    size: 1,
    opacity: 1,
    noise: 0,
    flow: 0,
    wave: 0,
    spin: 0,
    fog: 0,
    spot: 0,
  };
}

function blendInto(out: Blended, a: StageLayout | Blended, b: StageLayout | Blended, t: number) {
  for (const key of NUMERIC_KEYS) out[key] = lerp(a[key], b[key], t);
  const ca = typeof a.color === "string" ? hexToRgb(a.color) : a.color;
  const cb = typeof b.color === "string" ? hexToRgb(b.color) : b.color;
  const aa = typeof a.accent === "string" ? hexToRgb(a.accent) : a.accent;
  const ab = typeof b.accent === "string" ? hexToRgb(b.accent) : b.accent;
  for (let i = 0; i < 3; i += 1) {
    out.color[i] = lerp(ca[i], cb[i], t);
    out.accent[i] = lerp(aa[i], ab[i], t);
  }
}

function copyBlended(out: Blended, from: Blended) {
  for (const key of NUMERIC_KEYS) out[key] = from[key];
  out.color = [...from.color];
  out.accent = [...from.accent];
}

/** Zonas de repouso perto de cada keyframe: a forma "assenta" antes de mudar. */
const segmentEase = (t: number) => easeInOut(clamp01((t - 0.14) / 0.72));

// ── SEÇÃO: componente ────────────────────────────────────────────────────────

interface ParticleFieldProps {
  atlas: ShapeAtlas;
}

export function ParticleField({ atlas }: ParticleFieldProps) {
  const groupRef = useRef<Group>(null);
  const pointsRef = useRef<Points<BufferGeometry, ShaderMaterial>>(null);
  const size = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  const gl = useThree((state) => state.gl);

  const texture = useMemo(() => {
    const tex = new DataArrayTexture(atlas.data, atlas.side, atlas.side, atlas.layers);
    tex.format = RGBAFormat;
    tex.type = FloatType;
    tex.minFilter = NearestFilter;
    tex.magFilter = NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }, [atlas]);

  const geometry = useMemo(() => {
    const { count, side } = atlas;
    const refs = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const random = createRandom(42);
    for (let i = 0; i < count; i += 1) {
      refs[i * 3] = ((i % side) + 0.5) / side;
      refs[i * 3 + 1] = (Math.floor(i / side) + 0.5) / side;
      for (let k = 0; k < 4; k += 1) randoms[i * 4 + k] = random();
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(refs, 3));
    geo.setAttribute("aRandom", new BufferAttribute(randoms, 4));
    return geo;
  }, [atlas]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        glslVersion: GLSL3,
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        premultipliedAlpha: true,
        blending: NormalBlending,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uShapes: { value: texture },
          uFrom: { value: 0 },
          uTo: { value: 0 },
          uMix: { value: 0 },
          uTime: { value: 0 },
          uAppear: { value: 0 },
          uSize: { value: 2 },
          uPixelRatio: { value: 1 },
          uViewportPx: { value: 900 },
          uNoise: { value: 0 },
          uFlow: { value: 0 },
          uWave: { value: 0 },
          uFog: { value: 0 },
          uSpot: { value: 0 },
          uTurbulence: { value: 0 },
          uColor: { value: new Vector3(1, 1, 1) },
          uAccent: { value: new Vector3(1, 1, 1) },
          uAccentMix: { value: 0 },
          uOpacity: { value: 1 },
          uPointer: { value: new Vector3(0, 0, 0) },
          uPointerStrength: { value: 0 },
          uPulse: { value: new Vector3(0, 0, -100) },
        },
      }),
    [texture],
  );

  // Recursos de GPU liberados no unmount (R3F não descarta o que vem por prop)
  useEffect(
    () => () => {
      texture.dispose();
      geometry.dispose();
      material.dispose();
    },
    [texture, geometry, material],
  );

  // Estado de animação mantido fora do React
  const anim = useRef({
    ready: false,
    spin: 0,
    pointerX: 0,
    pointerY: 0,
    parallaxX: 0,
    parallaxY: 0,
    turbulence: 0,
    displayed: createBlended(),
    scratch: createBlended(),
    displayedShape: "logo" as ShapeId,
    preview: {
      target: null as KeyframeId | null,
      baseShape: "logo" as ShapeId,
      base: createBlended(),
      mix: 1,
    },
  });

  useFrame((state, delta) => {
    const group = groupRef.current;
    const points = pointsRef.current;
    if (!group || !points) return;
    const a = anim.current;
    // uniforms via ref: o material é estável, mas mutá-lo fora do render é intencional
    const u = points.material.uniforms;
    const dt = Math.min(delta, 1 / 20);
    const time = state.clock.elapsedTime;

    // ── 1. Segmento atual do scroll ──
    const segment = stage.resolve(window.scrollY) ?? { from: "hero", to: "hero", t: 0 };
    const t = segmentEase(segment.t);
    const fromLayout = stage.layout(segment.from);
    const toLayout = stage.layout(segment.to);
    const scrollDominant = t < 0.5 ? fromLayout.shape : toLayout.shape;

    // ── 2. Preview do menu sobrepõe o scroll (troca de alvo = novo morph) ──
    const pv = a.preview;
    if (stage.preview !== pv.target) {
      pv.baseShape = a.displayedShape;
      copyBlended(pv.base, a.displayed);
      pv.target = stage.preview;
      pv.mix = 0;
    }
    pv.mix = Math.min(pv.mix + dt / 0.95, 1);

    let shapeFrom: ShapeId;
    let shapeTo: ShapeId;
    let shapeMix: number;
    const out = a.scratch;

    if (pv.target !== null) {
      const target = previewLayout(pv.target);
      const k = easeInOut(pv.mix);
      blendInto(out, pv.base, target, k);
      [shapeFrom, shapeTo, shapeMix] = [pv.baseShape, target.shape, k];
    } else if (pv.mix < 1) {
      // voltando do menu para a forma do scroll
      const k = easeInOut(pv.mix);
      blendInto(a.displayed, fromLayout, toLayout, t);
      blendInto(out, pv.base, a.displayed, k);
      [shapeFrom, shapeTo, shapeMix] = [pv.baseShape, scrollDominant, k];
    } else {
      blendInto(out, fromLayout, toLayout, t);
      [shapeFrom, shapeTo, shapeMix] = [fromLayout.shape, toLayout.shape, t];
    }

    // ── 3. Introdução: do logo do loader até o layout do hero ──
    const intro = stage.intro;
    if (intro.layout && intro.travel < 1) {
      const k = easeInOut(intro.travel);
      for (const key of NUMERIC_KEYS) {
        const from = intro.layout[key];
        if (typeof from === "number") out[key] = lerp(from, out[key], k);
      }
    }

    copyBlended(a.displayed, out);
    a.displayedShape = shapeMix < 0.5 ? shapeFrom : shapeTo;
    const L = a.displayed;

    // ── 4. Ponteiro, parallax e turbulência (amortecidos) ──
    const pointer = stage.pointer;
    a.pointerX = damp(a.pointerX, (pointer.x * viewport.width) / 2, 9, dt);
    a.pointerY = damp(a.pointerY, (pointer.y * viewport.height) / 2, 9, dt);
    a.parallaxX = damp(a.parallaxX, pointer.active ? pointer.x : 0, 2.5, dt);
    a.parallaxY = damp(a.parallaxY, pointer.active ? pointer.y : 0, 2.5, dt);
    u.uPointerStrength.value = damp(u.uPointerStrength.value, pointer.active ? 1 : 0, 4, dt);
    (u.uPointer.value as Vector3).set(a.pointerX, a.pointerY, 0);

    a.turbulence = damp(a.turbulence, Math.min(Math.abs(stage.velocity) * 0.0035, 0.16), 5, dt);
    u.uTurbulence.value = a.turbulence;

    const pulseAge = (performance.now() - stage.pulse.time) / 1000;
    (u.uPulse.value as Vector3).set(
      (stage.pulse.x * viewport.width) / 2,
      (stage.pulse.y * viewport.height) / 2,
      time - pulseAge,
    );

    // ── 5. Transformação do grupo ──
    group.position.set(L.x * viewport.width, L.y * viewport.height, 0);
    group.scale.setScalar((L.scale * viewport.height) / 2);
    group.rotation.set(L.rotX - a.parallaxY * 0.1, L.rotY + a.parallaxX * 0.16, L.rotZ);

    // ── 6. Uniforms ──
    // spin integrado no CPU: mudar a velocidade não "salta" o ângulo
    a.spin += L.spin * dt;
    u.uTime.value = time;
    u.uFrom.value = atlas.index[shapeFrom];
    u.uTo.value = atlas.index[shapeTo];
    u.uMix.value = shapeFrom === shapeTo ? 0 : shapeMix;
    u.uAppear.value = intro.appear;
    u.uSize.value = L.size;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uViewportPx.value = size.height;
    u.uNoise.value = L.noise;
    u.uFlow.value = L.flow;
    u.uWave.value = L.wave;
    u.uFog.value = L.fog;
    u.uSpot.value = L.spot;
    u.uAccentMix.value = L.accentMix;
    u.uOpacity.value = L.opacity;
    (u.uColor.value as Vector3).set(...L.color);
    (u.uAccent.value as Vector3).set(...L.accent);
    group.rotation.y += a.spin;

    if (!a.ready) {
      a.ready = true;
      // o primeiro frame já compilou o programa: o loader pode seguir
      queueMicrotask(() => stage.markReady());
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
