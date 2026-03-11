export interface Option {
  optionId: number;
  optionText: string;
}

export interface Question {
  questionId: number;
  questionText: string;
  options: Option[];
}
