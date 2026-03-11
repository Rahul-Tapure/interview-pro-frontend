export interface CodingQuestion {
  testCases: any;
  questionId: number;
  title: string;
  difficulty: string;
  description: string;
  constraints: string;
  timeLimit: number;
  memoryLimit: number;
  published: boolean;
  createdBy: string;
}
