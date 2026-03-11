// test-question-review.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { McqCreatorService } from '../../services/mcq-creator.service';

@Component({
  standalone: true,
  selector: 'app-test-question-review',
  imports: [CommonModule],
  templateUrl: './test-question-review.html',
  styleUrls: ['./test-question-review.css']
})
export class TestQuestionReviewComponent {

  private route          = inject(ActivatedRoute);
  private creatorService = inject(McqCreatorService);

  test$ = this.route.paramMap.pipe(
    switchMap(params => {
      const testId = Number(params.get('testId'));
      return this.creatorService.viewFullTest(testId);
    })
  );

  /** Returns A, B, C, D... for a given 0-based option index */
  optionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /** Total number of correct options across all questions */
  correctCount(questions: any[]): number {
    if (!questions) return 0;
    return questions.reduce((sum, q) =>
      sum + (q.options?.filter((o: any) => o.correct).length ?? 0), 0
    );
  }
}