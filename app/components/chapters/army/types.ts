import * as THREE from "three";

/**
 * ── METADADOS DOS ALVOS ──────────────────────────────────────────────────────
 * Representa os metadados e referências de materiais/luzes anexados a cada alvo.
 * Usar uma interface estrita evita o uso de `any` e garante segurança na GPU.
 */
export interface TargetUserData {
  /** Identificador único do alvo */
  id: number;
  /** Flag de controle de estado: ativado/desativado */
  isFound: boolean;
  /** Referência direta ao Mesh da esfera para cálculo de interseção (Raycaster) */
  sphere: THREE.Mesh;
  /** Referência ao anel decorativo */
  ring: THREE.Mesh;
  /** Luz pontual local (usada apenas para o pulso sutil do alvo, não é a lanterna) */
  ptLight: THREE.PointLight;
  /** Cache do material do anel para animação GSAP sem overhead de busca */
  ringMat: THREE.MeshStandardMaterial;
  /** Cache do material da esfera para alteração de emissividade (PBR) */
  sphereMat: THREE.MeshStandardMaterial;
  /** Texto que será injetado no HUD (React) quando o alvo for escaneado */
  text: string;
  /** Offset trigonométrico para descompassar o pulso das luzes (evita uniformidade) */
  pulseOffset: number;
}

/**
 * Tipo específico para o Grupo do Alvo.
 * Faz o cast seguro do `userData` nativo do Three.js para nossa interface estrita.
 */
export interface TargetGroup extends THREE.Group {
  userData: TargetUserData;
}

/**
 * ── ESTADO GLOBAL DA CENA (SINGLE SOURCE OF TRUTH) ───────────────────────────
 * Passado por referência entre os módulos para evitar alocação de memória no loop.
 */
export interface ThreeState {
  // ── Core do Three.js ──
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  
  // ── Elementos Visuais ──
  /** Sistema de partículas (poeira atmosférica instanciada via BufferGeometry) */
  particles: THREE.Points;
  /** Array contendo a referência em memória dos alvos ativos */
  targets: TargetGroup[];
  
  // Nota: `flashlight` e `flashlightTarget` foram removidos intencionalmente! 
  // O efeito da lanterna agora roda via Shader na GPU para performance extrema.

  // ── Interação ──
  /** Instância única e reutilizável do Raycaster (Zero Allocation no loop) */
  raycaster: THREE.Raycaster;
  /** Vetor 2D estático (0,0) fixado no centro da tela para precisão do tiro/lanterna */
  centerVec: THREE.Vector2;
  
  // ── Loop e Sincronização ──
  /** ID do frame atual para um cleanup perfeito via cancelAnimationFrame */
  animFrameId: number;
  /** Relógio interno para animações procedurais imunes a quedas de FPS */
  clock: THREE.Clock;
  /** Contador de progresso do jogador */
  targetsFound: number;
  
  // ── Controles de Câmera ──
  /** Rotação horizontal (Euler Y) */
  yaw: number;
  /** Rotação vertical (Euler X) travada para evitar gimbal lock / cambalhotas */
  pitch: number;
  /** Controle de estado do Pointer Lock API (Desktop) */
  isPointerLocked: boolean;

  // ── GESTÃO ESTREMA DE MEMÓRIA (VRAM) ───────────────────────────────────────
  // Dicionários centrais para rastrear todas as alocações da placa de vídeo.
  // Essencial para o método `dispose()` iterar e limpar tudo no Unmount do React.
  /** Pool de Geometrias: Reutilizadas via Instancing e Clone */
  geometries: Record<string, THREE.BufferGeometry>;
  /** Pool de Materiais: Rastreia shaders customizados e materiais PBR */
  materials: Record<string, THREE.Material | THREE.Material[]>;
}