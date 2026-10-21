import type { KeyframeId } from "@/lib/stage/layouts";
import type { ChapterId } from "@/types/dictionary";

/** Ordem narrativa dos capítulos — fonte única para página, menu e indicador. */
export const CHAPTERS = [
  "hero",
  "about",
  "education",
  "army",
  "thomson",
  "skills",
  "vellum",
  "unna",
  "projects",
  "connect",
] as const satisfies readonly ChapterId[];

export const formatIndex = (index: number) => String(index + 1).padStart(2, "0");

/** Forma do palco que representa cada capítulo (usada no preview do menu). */
export const CHAPTER_KEYFRAME: Record<ChapterId, KeyframeId> = {
  hero: "hero",
  about: "about",
  education: "education",
  army: "army",
  thomson: "thomson-logo",
  skills: "skills",
  vellum: "vellum",
  unna: "unna",
  projects: "projects",
  connect: "connect",
};
