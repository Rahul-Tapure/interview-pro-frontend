// edit-test.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { McqCreatorService } from '../../services/mcq-creator.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-edit-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-test.html',
  styleUrls: ['./edit-test.css']
})
export class EditTestComponent implements OnInit {

  testId!: number;
  test$!: Observable<any>;
  test: any;

  loading     = true;
  saving      = false;
  isAttempted = false;

  constructor(
    private route: ActivatedRoute,
    private creatorService: McqCreatorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.test$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.testId = Number(params.get('id'));
        return this.creatorService.getTestForEdit(this.testId);
      }),
      tap(res => {
        this.test    = res;
        this.loading = false;
      })
    );
  }

  /* ── Option letter label (A, B, C...) ── */
  optionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /* ── Question Methods ─────────────────── */
  addQuestion(): void {
    this.test.questions.push({
      questionId:   null,
      questionText: '',
      difficulty:   'MEDIUM',
      options:      []
    });
  }

  deleteQuestion(index: number): void {
    this.test.questions.splice(index, 1);
  }

  /* ── Option Methods ───────────────────── */
  addOption(q: any): void {
    q.options.push({ optionId: null, optionText: '', isCorrect: false });
  }

  deleteOption(q: any, index: number): void {
    q.options.splice(index, 1);
  }

  markCorrect(q: any, selectedOpt: any): void {
    q.options.forEach((opt: any) => opt.isCorrect = false);
    selectedOpt.isCorrect = true;
  }

  /* ── Validation ───────────────────────── */
  hasInvalidOptions(): boolean {
    for (const q of this.test.questions) {
      if (!q.options || q.options.length < 2) return true;
      for (const o of q.options) {
        if (!o.optionText || !o.optionText.trim()) return true;
      }
      const correctCount = q.options.filter((o: any) => o.isCorrect).length;
      if (correctCount !== 1) return true;
    }
    return false;
  }

  /* ── Save ─────────────────────────────── */
  saveChanges(): void {
    for (const q of this.test.questions) {
      if (!q.difficulty) {
        alert('❌ Every question must have a difficulty level');
        return;
      }
    }

    if (this.hasInvalidOptions()) {
      alert(
        '❌ Each question must:\n' +
        '• Have at least 2 options\n' +
        '• Have NO empty option text\n' +
        '• Have exactly ONE correct option'
      );
      return;
    }

    this.saving = true;

    const payload = {
      title:           this.test.title,
      durationMinutes: this.test.durationMinutes,
      questions: this.test.questions.map((q: any) => ({
        questionId:   q.questionId,
        questionText: q.questionText,
        difficulty:   q.difficulty,
        options: q.options.map((o: any) => ({
          optionId:  o.optionId,
          optionText: o.optionText,
          isCorrect:  o.isCorrect
        }))
      }))
    };

    this.creatorService.updatePrivateTest(this.testId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(
          ['/dashboard/creator'],
          { queryParams: { message: '✅ Test Updated Successfully' } }
        );
      },
      error: (err) => {
        this.saving = false;
        alert(err.error?.message || '❌ Update Failed!');
        console.error('Update error:', err);
      }
    });
  }
}