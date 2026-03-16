import en from "@/dictionaries/en.json";
import type { ArmyDictionary } from "@/types/chapter-army";
import type { ThomsonDictionary } from "@/types/chapter-thomson";
import type { VellumDictionary } from "@/types/chapter-vellum";
import type { SkillsGraphDictionary } from "@/types/chapter-skills";

type WidenLiterals<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends (infer U)[]
        ? WidenLiterals<U>[]
        : T extends object
          ? { [K in keyof T]: WidenLiterals<T[K]> }
          : T;

export type Dictionary = WidenLiterals<typeof en> & {
  army: ArmyDictionary;
  thomson: ThomsonDictionary;
  vellum: VellumDictionary;
  skills: SkillsGraphDictionary;
};