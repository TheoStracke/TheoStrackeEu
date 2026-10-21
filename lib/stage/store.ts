import { KEYFRAMES, type KeyframeId, type StageLayout } from "./layouts";

// ═══════════════════════════════════════════════════════════════════════════
// Store do palco — estado mutável lido a cada frame pelo canvas. Sem React
// de propósito: nada aqui deve causar re-render. Os capítulos registram
// posições de scroll; o canvas resolve "entre quais formas estamos".
// ═══════════════════════════════════════════════════════════════════════════

interface KeyframeEntry {
  id: KeyframeId;
  getScroll: () => number;
}

export interface ResolvedSegment {
  from: KeyframeId;
  to: KeyframeId;
  /** progresso 0…1 entre os dois keyframes */
  t: number;
}

class StageStore {
  private entries = new Map<string, KeyframeEntry>();
  private sorted: { id: KeyframeId; pos: number }[] = [];
  private dirty = true;

  /** ponteiro em NDC (-1…1) */
  readonly pointer = { x: 0, y: 0, active: false };
  /** pulso de clique: origem em NDC + instante (s) */
  readonly pulse = { x: 0, y: 0, time: -100 };
  /** velocidade do scroll (px/frame, vinda do Lenis) */
  velocity = 0;
  /** forma em destaque no menu (sobrepõe o scroll) */
  preview: KeyframeId | null = null;

  setPreview(id: KeyframeId | null) {
    this.preview = id;
  }
  /**
   * Introdução: `appear` monta as partículas a partir da dispersão;
   * `travel` leva do layout do loader até o layout resolvido pelo scroll.
   */
  readonly intro: { appear: number; travel: number; layout: Partial<StageLayout> | null } = {
    appear: 0,
    travel: 1,
    layout: null,
  };

  private overrides = new Map<KeyframeId, StageLayout>();
  private ready = false;
  private readyListeners = new Set<() => void>();

  register(key: string, id: KeyframeId, getScroll: () => number): () => void {
    this.entries.set(key, { id, getScroll });
    this.dirty = true;
    return () => {
      this.entries.delete(key);
      this.dirty = true;
    };
  }

  /** Chamado a cada ScrollTrigger.refresh (posições mudam com resize/pins). */
  invalidate() {
    this.dirty = true;
  }

  resolve(scroll: number): ResolvedSegment | null {
    if (this.dirty) {
      this.sorted = [...this.entries.values()]
        .map(({ id, getScroll }) => ({ id, pos: getScroll() }))
        .sort((a, b) => a.pos - b.pos);
      this.dirty = false;
    }

    const list = this.sorted;
    if (list.length === 0) return null;

    const first = list[0];
    const last = list[list.length - 1];
    if (scroll <= first.pos) return { from: first.id, to: first.id, t: 0 };
    if (scroll >= last.pos) return { from: last.id, to: last.id, t: 0 };

    for (let i = 0; i < list.length - 1; i += 1) {
      const a = list[i];
      const b = list[i + 1];
      if (scroll < b.pos) {
        const span = b.pos - a.pos;
        return { from: a.id, to: b.id, t: span > 0 ? (scroll - a.pos) / span : 1 };
      }
    }
    return { from: last.id, to: last.id, t: 0 };
  }

  /** Layout efetivo do keyframe (config + ajuste medido em runtime). */
  layout(id: KeyframeId): StageLayout {
    return this.overrides.get(id) ?? KEYFRAMES[id];
  }

  /** Ajusta um layout com medidas reais do DOM (ex.: tamanho do grafo de skills). */
  override(id: KeyframeId, patch: Partial<StageLayout> | null) {
    if (patch) this.overrides.set(id, { ...KEYFRAMES[id], ...patch });
    else this.overrides.delete(id);
  }

  get isReady() {
    return this.ready;
  }

  markReady() {
    if (this.ready) return;
    this.ready = true;
    this.readyListeners.forEach((listener) => listener());
  }

  /** Resolve quando as formas estiverem na GPU (o loader espera por isso). */
  whenReady(): Promise<void> {
    if (this.ready) return Promise.resolve();
    return new Promise((resolve) => {
      const listener = () => {
        this.readyListeners.delete(listener);
        resolve();
      };
      this.readyListeners.add(listener);
    });
  }

  reset() {
    this.ready = false;
    this.preview = null;
    this.intro.appear = 0;
    this.intro.travel = 1;
    this.intro.layout = null;
  }
}

export const stage = new StageStore();
