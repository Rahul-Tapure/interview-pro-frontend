// question-add.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators,
  FormArray, ReactiveFormsModule
} from '@angular/forms';
import { McqCreatorService } from '../../services/mcq-creator.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: './question-add.component.html',
  styleUrls: ['./question-add.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class QuestionAddComponent implements OnInit {

  form!: FormGroup;
  isSubmitting = false;

  testId!: number;
  test$!: Observable<any>;

  currentIndex = 0;
  questionIds: number[] = [];

  editingQuestionId?: number;
  addMode = true;

  /** Used for the difficulty chip buttons */
  difficulties = [
    { value: 'EASY',   label: 'Easy',   emoji: '🟢' },
    { value: 'MEDIUM', label: 'Medium', emoji: '🟡' },
    { value: 'HARD',   label: 'Hard',   emoji: '🔴' },
  ];

  constructor(
    private fb: FormBuilder,
    private creatorService: McqCreatorService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('testId'));

    this.form = this.fb.group({
      questionText: ['', Validators.required],
      difficulty:   ['MEDIUM', Validators.required],
      options:      this.fb.array([])
    });

    this.test$ = this.creatorService.getTestDetails(this.testId);

    this.creatorService.getTestQuestionIds(this.testId).subscribe(ids => {
      this.questionIds = ids;
      if (ids.length > 0) {
        this.addMode = false;
        this.loadQuestion(ids[0]);
      } else {
        this.initEmptyOptions();
      }
    });
  }

  /* ── Options FormArray ─────────────────────── */
  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  createOption() {
    return this.fb.group({
      optionId:   [null],
      optionText: ['', Validators.required],
      isCorrect:  [false]
    });
  }

  initEmptyOptions() {
    this.options.clear();
    for (let i = 0; i < 4; i++) this.options.push(this.createOption());
  }

  hasCorrectOption(): boolean {
    return this.options.value.some((o: any) => o.isCorrect === true);
  }

  /* ── Load Question ─────────────────────────── */
  loadQuestion(questionId: number) {
    this.creatorService.getPreviousQuestion(questionId).subscribe(res => {
      this.addMode = false;
      this.editingQuestionId = res.questionId;
      this.form.patchValue({ questionText: res.questionText, difficulty: res.difficulty });
      this.options.clear();
      res.options.forEach((opt: any) => {
        this.options.push(this.fb.group({
          optionId:   [opt.optionId],
          optionText: [opt.optionText, Validators.required],
          isCorrect:  [opt.isCorrect === true]
        }));
      });
      this.cdr.detectChanges();
    });
  }

  /* ── Submit ────────────────────────────────── */
  submitQuestion(totalQuestions: number) {
    if (this.isSubmitting) return;
    if (this.form.invalid || !this.hasCorrectOption()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { questionText, difficulty } = this.form.value;

    // Update mode
    if (!this.addMode && this.editingQuestionId) {
      const updateOptions = this.options.value.map((o: any) => ({
        optionId: o.optionId, optionText: o.optionText, isCorrect: o.isCorrect
      }));

      this.creatorService.updateQuestion(this.editingQuestionId, {
        questionText, difficulty, options: updateOptions
      }).subscribe({
        next: () => {
          this.isSubmitting = false;
          if (this.currentIndex < this.questionIds.length - 1) {
            this.currentIndex++;
            this.loadQuestion(this.questionIds[this.currentIndex]);
          } else {
            alert('✅ Updated Successfully');
            this.resetForm();
            this.addMode = true;
          }
        },
        error: () => { alert('❌ Update Failed'); this.isSubmitting = false; }
      });
      return;
    }

    // Add mode
    const addOptionsPayload = this.options.value.map((o: any) => ({
      optionText: o.optionText, isCorrect: o.isCorrect
    }));

    this.creatorService.addQuestion(this.testId, { questionText, difficulty }).subscribe({
      next: (qRes) => {
        this.questionIds.push(qRes.questionId);
        this.currentIndex = this.questionIds.length - 1;

        this.creatorService.addOptions(qRes.questionId, addOptionsPayload).subscribe({
          next: () => {
            this.isSubmitting = false;
            if (this.questionIds.length === totalQuestions) {
              alert('✅ All Questions Added!');
              this.router.navigate(['/dashboard/creator'], {
                queryParams: { message: '✅ Test Created Successfully' }
              });
            } else {
              this.resetForm();
            }
          },
          error: () => { alert('❌ Option Save Failed!'); this.isSubmitting = false; }
        });
      },
      error: () => { alert('❌ Question Save Failed!'); this.isSubmitting = false; }
    });
  }

  /* ── Helpers ───────────────────────────────── */
  resetForm() {
    this.form.reset({ difficulty: 'MEDIUM' });
    this.initEmptyOptions();
  }

  previous() {
    if (this.currentIndex <= 0) return;
    this.currentIndex--;
    this.loadQuestion(this.questionIds[this.currentIndex]);
  }

  next() {
    if (this.currentIndex >= this.questionIds.length - 1) {
      this.addMode = true;
      this.editingQuestionId = undefined;
      this.resetForm();
      return;
    }
    this.currentIndex++;
    this.loadQuestion(this.questionIds[this.currentIndex]);
  }

  optionLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  markCorrect(index: number) {
    this.options.controls.forEach((c, i) => c.patchValue({ isCorrect: i === index }));
  }
}