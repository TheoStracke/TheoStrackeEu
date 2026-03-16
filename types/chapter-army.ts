export interface ArmyDictionary {
  intro: string;
  target1: string;
  target2: string;
  target3: string;
  complete: string;
  skip: string;
}

export interface ChapterArmyProps {
  dict: ArmyDictionary;
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export interface ArmyGameState {
  mouseX: number;
  mouseY: number;
  width: number;
  height: number;
  isMobile: boolean;
  isPointerLocked: boolean;
  targetsFound: number;
  isDirty: boolean;
  targets: TargetNode[];
}

export interface TargetNode {
  id: "target1" | "target2" | "target3";
  x: number;
  y: number;
  radius: number;
  isFound: boolean;
}