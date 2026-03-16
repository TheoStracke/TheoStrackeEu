import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import type { ThreeState, TargetGroup } from "./types";
import { injectFlashlightShader } from "./scene";

export const setupTargets = (state: ThreeState, dict: any, positions: { x: number; z: number }[]) => {
  const targetTexts = [dict.target1, dict.target2, dict.target3];

  // Geometria de Alvo: Disco maior e fixo
  state.geometries.targetDisc = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32);
  
  positions.forEach((pos, i) => {
    const group = new THREE.Group() as TargetGroup;
    group.position.set(pos.x, 1.8, pos.z); // Altura fixa dos olhos

    // Material com cara de alvo (Anéis concêntricos via Emissive Map ou Cor)
    const targetMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: 0xff0000,
      emissiveIntensity: 0.3,
      roughness: 0.4
    });
    targetMat.onBeforeCompile = injectFlashlightShader;

    const mesh = new THREE.Mesh(state.geometries.targetDisc, targetMat);
    mesh.rotation.x = Math.PI / 2; // Fica de frente para o jogador
    
    // Luz de "foco" atrás do alvo
    const ptLight = new THREE.PointLight(0xff0000, 0.5, 5);
    
    group.add(mesh, ptLight);

    group.userData = {
      id: i,
      isFound: false,
      sphere: mesh, // Usamos o disco para detecção agora
      ring: mesh, 
      ptLight,
      ringMat: targetMat,
      sphereMat: targetMat,
      text: targetTexts[i] || "OBJETIVO",
      pulseOffset: 0
    };

    state.scene.add(group);
    state.targets.push(group);
  });
};

export const updateTargets = (state: ThreeState) => {
  const t = state.clock.getElapsedTime();
  state.targets.forEach((target) => {
    const data = target.userData;
    if (!data.isFound) {
      data.ptLight.intensity = 0.4 + Math.sin(t * 2) * 0.2;
    }
  });
};

export const checkTargets = (
  state: ThreeState,
  onTargetFound: (text: string, count: number) => void,
  onAllFound: () => void
) => {
  // (0,0) representa o centro exato da tela no espaço NDC do Three.js.
  state.raycaster.setFromCamera(new THREE.Vector2(0, 0), state.camera);
  state.raycaster.far = 40;

  const activeTargets = state.targets.filter((target) => !target.userData.isFound);

  activeTargets.forEach((target) => {
    const data = target.userData;
    const hit = state.raycaster.intersectObject(data.sphere);

    if (hit.length > 0) {
      data.isFound = true;
      state.targetsFound++;
      
      // Feedback visual de acerto (Verde neon)
      data.sphereMat.emissive.setHex(0xc8ff00);
      data.sphereMat.emissiveIntensity = 2;
      
      onTargetFound(data.text, state.targetsFound);
      if (state.targetsFound >= state.targets.length) {
        onAllFound();
      }
    }
  });
};