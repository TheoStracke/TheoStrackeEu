export interface SkillNode {
  id: string;
  label: string;
  category: "language" | "framework" | "database" | "tooling";
}

export interface SkillLink {
  source: string;
  target: string;
  projects: string[];
}

export interface SkillsGraphDictionary {
  title: string;
  eyebrow: string;
  nodes: SkillNode[];
  links: SkillLink[];
}
