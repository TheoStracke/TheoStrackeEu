import en from "@/dictionaries/en.json"
import type { ArmyDictionary } from "@/types/chapter-army"
import type { ThomsonDictionary } from "@/types/chapter-thomson"

export type Dictionary = typeof en & {
	army: ArmyDictionary
	thomson: ThomsonDictionary
}