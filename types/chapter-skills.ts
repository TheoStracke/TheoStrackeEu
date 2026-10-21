export type SkillCategory = "language" | "framework" | "database" | "tooling";

export interface SkillNode {
  id: string;
  label: string;
  category: SkillCategory;
}

export interface SkillLink {
  source: string;
  target: string;
  projects: string[];
}

export interface SkillsGraphDictionary {
  eyebrow: string;
  title: string;
  hint: string;
  nodes: SkillNode[];
  links: SkillLink[];
}
