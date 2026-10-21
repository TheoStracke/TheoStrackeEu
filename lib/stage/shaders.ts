// ═══════════════════════════════════════════════════════════════════════════
// Shaders do campo de partículas (GLSL ES 3.0 / WebGL2).
// Toda a animação acontece na GPU: o CPU só atualiza ~25 uniforms por frame.
// ═══════════════════════════════════════════════════════════════════════════

// Simplex noise 3D — Ian McEwan, Ashima Arts / Stefan Gustavson (MIT License)
// https://github.com/ashima/webgl-noise
const SIMPLEX_NOISE = /* glsl */ `
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 p) {
  return vec3(snoise(p), snoise(p + vec3(31.4, 7.1, 11.7)), snoise(p + vec3(-17.3, 23.9, -5.2)));
}
`;

export const particleVertexShader = /* glsl */ `
precision highp float;
precision highp sampler2DArray;

uniform sampler2DArray uShapes;
uniform float uFrom;
uniform float uTo;
uniform float uMix;

uniform float uTime;
uniform float uAppear;
uniform float uSize;
uniform float uPixelRatio;
uniform float uViewportPx;

uniform float uNoise;
uniform float uFlow;
uniform float uWave;
uniform float uFog;
uniform float uSpot;
uniform float uTurbulence;

uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uAccentMix;
uniform float uOpacity;

uniform vec3 uPointer;
uniform float uPointerStrength;
uniform vec3 uPulse;

in vec4 aRandom;

out vec3 vColor;
out float vAlpha;

${SIMPLEX_NOISE}

const float PI = 3.14159265359;

void main() {
  vec2 ref = position.xy;

  // ── Morph entre as duas camadas, com atraso individual (fluxo orgânico) ──
  vec3 a = texture(uShapes, vec3(ref, uFrom)).xyz;
  vec3 b = texture(uShapes, vec3(ref, uTo)).xyz;
  float delay = aRandom.x * 0.4;
  float m = smoothstep(delay, delay + 0.6, uMix);
  vec3 p = mix(a, b, m);

  // turbulência que só existe no meio da viagem
  float transit = sin(m * PI);
  p += snoiseVec3(p * 1.4 + aRandom.yzw * 4.0 + uTime * 0.15) * transit * 0.28;

  // ── Comportamentos por forma ──
  float fall = mod(p.y + 1.0 - uTime * (0.18 + aRandom.y * 0.42), 2.0) - 1.0;
  p.y = mix(p.y, fall, uFlow);

  p.y += sin(p.x * 3.1 + uTime * 0.7) * cos(p.z * 2.4 + uTime * 0.55) * 0.09 * uWave;

  p += snoiseVec3(p * 0.8 + aRandom.xyz * 9.0 + uTime * 0.12) * uNoise;

  // ── Entrada: partículas convergem de uma dispersão esférica ──
  vec3 dir = normalize(aRandom.xyz * 2.0 - 1.0 + vec3(1e-3));
  vec3 scattered = dir * (2.5 + aRandom.w * 3.5);
  float appear = smoothstep(aRandom.y * 0.45, aRandom.y * 0.45 + 0.55, uAppear);
  p = mix(scattered, p, appear);

  vec4 world = modelMatrix * vec4(p, 1.0);

  // ── Cursor: repulsão suave + leve avanço em z ──
  vec2 toPointer = world.xy - uPointer.xy;
  float pointerDist = length(toPointer);
  float push = exp(-(pointerDist * pointerDist) / 0.32) * uPointerStrength;
  world.xy += (toPointer / max(pointerDist, 1e-4)) * push * 0.42;
  world.z += push * 0.5;

  // ── Pulso de clique: anel que se expande ──
  float age = uTime - uPulse.z;
  float radius = age * 3.2;
  vec2 toPulse = world.xy - uPulse.xy;
  float pulseDist = length(toPulse);
  float ring = exp(-pow((pulseDist - radius) * 3.5, 2.0)) * exp(-age * 1.6) * step(0.0, age);
  world.xy += (toPulse / max(pulseDist, 1e-4)) * ring * 0.35;

  // ── Velocidade do scroll agita levemente o campo ──
  world.xyz += snoiseVec3(world.xyz * 0.7 + uTime * 0.6) * uTurbulence;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float size = uSize * (0.55 + aRandom.z * 0.9);
  gl_PointSize = size * uPixelRatio * (uViewportPx / 900.0) * (10.0 / -mv.z);

  // ── Cor: base + respingos de accent ──
  vColor = mix(uColor, uAccent, step(1.0 - uAccentMix, aRandom.w));

  float fog = mix(1.0, smoothstep(-4.8, 0.4, world.z), uFog);
  float spot = mix(1.0, 0.45 + exp(-(pointerDist * pointerDist) / 1.4) * 1.2, uSpot);
  // chuva: cabeça brilhante descendo por coluna, com cauda que se apaga
  float column = fract(sin(floor(p.x * 11.4 + 0.5) * 91.7) * 43758.5);
  float trail = fract(fall * 0.7 + column + uTime * (0.25 + column * 0.3));
  float rain = mix(1.0, 0.1 + pow(trail, 3.0) * 2.2, uFlow);

  vAlpha = uOpacity * appear * fog * spot * rain * (0.65 + transit * 0.35);
}
`;

export const particleFragmentShader = /* glsl */ `
precision highp float;

in vec3 vColor;
in float vAlpha;

out vec4 fragColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  // disco com núcleo definido e halo suave
  float alpha = smoothstep(0.5, 0.0, d);
  alpha = alpha * alpha * vAlpha;
  if (alpha < 0.004) discard;
  // saída pré-multiplicada (canvas transparente compõe corretamente)
  fragColor = vec4(vColor * alpha, alpha);
}
`;
