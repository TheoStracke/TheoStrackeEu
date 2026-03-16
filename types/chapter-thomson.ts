export interface ThomsonDictionary {
  intro: string;
  instruction: string;
  complete: string;
  skip: string;
  cards: {
    card1: string;
    card2: string;
    card3: string;
  };
}

export interface ChapterThomsonProps {
  dict: ThomsonDictionary;
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export interface MatrixDrop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
}

export interface DataNode {
  id: string;
  x: number;
  y: number;
}

export interface DragState {
  activeNode: string | null;
  currentX: number;
  currentY: number;
}