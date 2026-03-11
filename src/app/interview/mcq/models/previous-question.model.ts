export interface PreviousOption {
  optionId: number;
  optionText: string;
  isCorrect: boolean;
}

export interface PreviousQuestion {
  questionId: number;
  questionText: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: PreviousOption[];
}
