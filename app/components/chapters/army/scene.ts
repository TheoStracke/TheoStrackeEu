import * as THREE from "three";
import type { ThreeState } from "./types";

// Variáveis utilitárias para evitar novas instâncias no loop
const _tempVec3 = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();

// Uniforms globais para o Custom Shader da Lanterna
const flashlightUniforms = {
  uCameraPos: { value: new THREE.Vector3() },
  uCameraDir: { value: new THREE.Vector3() },
};

// Exportamos o injetor para ser usado no targets.ts e em outros materiais
export const injectFlashlightShader = (shader: any) => {
  shader.uniforms.uCameraPos = flashlightUniforms.uCameraPos;
  shader.uniforms.uCameraDir = flashlightUniforms.uCameraDir;

  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `#include <common>\nvarying vec3 vWorldPos;`
  );
  shader.vertexShader = shader.vertexShader.replace(
    '#include <worldpos_vertex>',
    `#include <worldpos_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
  );

  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    `#include <common>\nuniform vec3 uCameraPos;\nuniform vec3 uCameraDir;\nvarying vec3 vWorldPos;`
  );

  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <dithering_fragment>',
    `#include <dithering_fragment>
    vec3 dirToPixel = normalize(vWorldPos - uCameraPos);
    float dist = length(vWorldPos - uCameraPos);
    float spotEffect = dot(uCameraDir, dirToPixel);
    float smoothSpot = smoothstep(0.92, 0.98, spotEffect);
    float attenuation = max(0.0, 1.0 - (dist / 35.0));
    gl_FragColor.rgb += vec3(1.0, 0.97, 0.9) * smoothSpot * attenuation * 1.5;`
  );
};

export const initScene = async (container: HTMLElement): Promise<ThreeState> => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = window.devicePixelRatio;

  // 1. PRIMEIRA COISA: Criar a Cena e Câmera
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020303);
  scene.fog = new THREE.FogExp2(0x020303, 0.035); // Neblina levemente mais suave

  const camera = new THREE.PerspectiveCamera(72, W / H, 0.1, 100);
  camera.position.set(0, 1.7, 0);

  // 2. Renderer (Otimizado)
  const renderer = new THREE.WebGLRenderer({ 
    antialias: dpr < 1.5, 
    powerPreference: "high-performance" 
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(dpr, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  const geometries: Record<string, THREE.BufferGeometry> = {};
  const materials: Record<string, THREE.Material> = {};

  // 3. Chão e Grid
  geometries.ground = new THREE.PlaneGeometry(200, 200);
  materials.ground = new THREE.MeshStandardMaterial({ color: 0x080b08, roughness: 0.9 });
  materials.ground.onBeforeCompile = injectFlashlightShader;
  
  const ground = new THREE.Mesh(geometries.ground, materials.ground);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const grid = new THREE.GridHelper(100, 60, 0x0d120d, 0x0a0f0a);
  scene.add(grid);

  // 4. VEGETAÇÃO (Agora declarada DEPOIS da scene estar pronta)
  const textureLoader = new THREE.TextureLoader();
  const treeTex = textureLoader.load('/tree.png'); // Certifique-se que o arquivo existe em /public
  
  // Usaremos Sprites simples para máxima performance
  const treeMat = new THREE.SpriteMaterial({ map: treeTex, color: 0x666666, fog: true });
  for (let i = 0; i < 60; i++) {
    const tree = new THREE.Sprite(treeMat);
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 40; // Não coloca árvores na cara do player (min 10m)
    const scale = 5 + Math.random() * 5;
    
    tree.position.set(Math.cos(angle) * radius, scale / 2, Math.sin(angle) * radius);
    tree.scale.set(scale, scale, 1);
    scene.add(tree);
  }

  // 5. Cenário Instanciado (Caixas/Pillares ao longe)
  geometries.box = new THREE.BoxGeometry(1, 1, 1);
  materials.box = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1 });
  materials.box.onBeforeCompile = injectFlashlightShader;
  
  const instancedBoxes = new THREE.InstancedMesh(geometries.box, materials.box, 5);
  const boxPositions = [
    {p: [20, 5, -30], s: [10, 10, 10]},
    {p: [-25, 3, -40], s: [8, 6, 8]},
    {p: [0, 8, -50], s: [15, 16, 15]},
    {p: [40, 4, 10], s: [12, 8, 12]},
    {p: [-35, 2, 20], s: [5, 4, 5]},
  ];

  boxPositions.forEach((data, i) => {
    _dummyObj.position.set(data.p[0], data.p[1], data.p[2]);
    _dummyObj.scale.set(data.s[0], data.s[1], data.s[2]);
    _dummyObj.updateMatrix();
    instancedBoxes.setMatrixAt(i, _dummyObj.matrix);
  });
  scene.add(instancedBoxes);

  // 6. Poeira Atmosférica
  const pCount = 300;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i*3] = (Math.random() - 0.5) * 60;
    pPos[i*3+1] = Math.random() * 10;
    pPos[i*3+2] = (Math.random() - 0.5) * 60;
  }
  geometries.particles = new THREE.BufferGeometry();
  geometries.particles.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  materials.particles = new THREE.PointsMaterial({ color: 0x445544, size: 0.03, transparent: true, opacity: 0.4 });
  const particles = new THREE.Points(geometries.particles, materials.particles);
  scene.add(particles);

  const raycaster = new THREE.Raycaster();
  const centerVec = new THREE.Vector2(0, 0);
  const clock = new THREE.Clock();

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize);

  return {
    scene, camera, renderer, particles,
    targets: [], raycaster, centerVec, clock, animFrameId: 0,
    yaw: 0, pitch: 0, isPointerLocked: false, targetsFound: 0,
    geometries, materials
  };
};

export const updateSceneElements = (state: ThreeState) => {
  state.particles.rotation.y += 0.0001;
  
  // Atualiza Uniforms do Shader para a lanterna seguir a câmera
  flashlightUniforms.uCameraPos.value.copy(state.camera.position);
  state.camera.getWorldDirection(flashlightUniforms.uCameraDir.value);
};

export const renderScene = (state: ThreeState) => {
  state.renderer.render(state.scene, state.camera);
};

export const destroyScene = (state: ThreeState, container: HTMLElement | null) => {
  cancelAnimationFrame(state.animFrameId);
  window.removeEventListener("resize", () => {}); // Idealmente usar ref da função
  if (container && state.renderer.domElement) container.removeChild(state.renderer.domElement);
  state.renderer.dispose();
  Object.values(state.geometries).forEach(g => g.dispose());
  Object.values(state.materials).forEach(m => Array.isArray(m) ? m.forEach(x => x.dispose()) : m.dispose());
};