export interface CodingQuestionListItem {
  id: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  published: boolean;
}
