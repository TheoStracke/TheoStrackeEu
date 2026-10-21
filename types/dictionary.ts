import type pt from "@/dictionaries/pt.json";
import type { SkillsGraphDictionary } from "@/types/chapter-skills";

// O JSON importado tem tipos literais; alarga para string/number para que
// en/es (com textos diferentes) satisfaçam o mesmo contrato.
export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? Widen<U>[]
        : T extends object
          ? { [K in keyof T]: Widen<T[K]> }
          : T;

// pt.json é o dicionário de referência: o schema nasce dele
export type Dictionary = Omit<Widen<typeof pt>, "skills"> & {
  skills: SkillsGraphDictionary;
};

export type ProjectItem = Dictionary["projects"]["items"][number];
export type ChapterId = keyof Dictionary["nav"]["chapters"];

// ── Contrato de paridade: a compilação falha se en/es divergirem do pt ──
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;

export type DictionaryParity = [
  Assert<Same<Widen<typeof import("@/dictionaries/en.json")>, Widen<typeof pt>>>,
  Assert<Same<Widen<typeof import("@/dictionaries/es.json")>, Widen<typeof pt>>>,
];
