import en from "@/dictionaries/en.json"
import type { ArmyDictionary } from "@/types/chapter-army"
import type { ThomsonDictionary } from "@/types/chapter-thomson"
import type { VellumDictionary } from "@/types/chapter-vellum"
import type { SkillsGraphDictionary } from "@/types/chapter-skills"

export type Dictionary = typeof en & {
	army: ArmyDictionary
	thomson: ThomsonDictionary
	vellum: VellumDictionary
	skills: SkillsGraphDictionary
}