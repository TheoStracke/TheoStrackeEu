"use client";

import { useEffect, type RefObject } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import type { KeyframeId } from "@/lib/stage/layouts";
import { stage } from "@/lib/stage/store";

interface KeyframeOptions {
  /** posição do ScrollTrigger em que a forma está "assentada" */
  at?: string;
  /** chave única quando o mesmo keyframe é registrado mais de uma vez */
  key?: string;
}

/**
 * Registra o momento de scroll em que o palco assume a forma `id`.
 * O ScrollTrigger serve só como régua: ele já considera pins e resize.
 */
export function useStageKeyframe(
  id: KeyframeId,
  target: RefObject<HTMLElement | null>,
  { at = "center center", key = id }: KeyframeOptions = {},
) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    // prioridade baixa: mede depois que os pins já inseriram seus espaçadores
    const ruler = ScrollTrigger.create({ trigger: el, start: at, refreshPriority: -1 });
    const unregister = stage.register(key, id, () => ruler.start);
    return () => {
      unregister();
      ruler.kill();
    };
  }, [id, target, at, key]);
}
