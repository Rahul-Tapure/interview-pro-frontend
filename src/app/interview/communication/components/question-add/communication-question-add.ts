// communication-question-add.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CommunicationService,
  CommunicationTest
} from '../../services/communication.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './communication-question-add.html',
  styleUrls: ['./communication-question-add.css']
})
export class CommunicationQuestionAddComponent implements OnInit {

  questionForm!: FormGroup;

  testId!: number;
  step!: number;
  totalQuestions!: number;

  questionId?: number;

  categories = [
    { value: 'INTRODUCTION', label: 'Introduction' },
    { value: 'BEHAVIORAL',   label: 'Behavioral' },
    { value: 'SITUATIONAL',  label: 'Situational' },
    { value: 'TECHNICAL',    label: 'Technical' },
    { value: 'GENERAL',      label: 'General' },
  ];

  difficulties = [
    { value: 'EASY',   label: 'Easy',   emoji: '🟢' },
    { value: 'MEDIUM', label: 'Medium', emoji: '🟡' },
    { value: 'HARD',   label: 'Hard',   emoji: '🔴' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: CommunicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('testId'));
    this.step = Number(this.route.snapshot.queryParamMap.get('step')) || 1;

    // Load test to get totalQuestions and check if published
    this.service.getTest(this.testId).subscribe((test: CommunicationTest) => {
      if (test.status !== 'DRAFT') {
        alert('⚠️ Only draft tests can be edited.');
        this.router.navigate(['/dashboard/creator']);
        return;
      }
      this.totalQuestions = test.totalQuestions || test.questions?.length || 0;
      this.cdr.detectChanges();
    });

    // Initialize form
    this.questionForm = this.fb.group({
      questionText:    ['', [Validators.required, Validators.minLength(10)]],
      timeLimit:       [120, [Validators.required, Validators.min(30), Validators.max(600)]],
      difficultyLevel: ['MEDIUM'],
      category:        ['GENERAL']
    });

    // Watch for step changes in query params
    this.route.queryParamMap.subscribe(params => {
      this.step = Number(params.get('step')) || 1;

      // Reset
      this.questionId = undefined;
      this.questionForm.reset({
        difficultyLevel: 'MEDIUM',
        timeLimit: 120,
        category: 'GENERAL'
      });

      // Load data for this step
      this.loadStepData();
    });
  }

  /** Load question data for current step */
  loadStepData(): void {
    this.service.getQuestionByStep(this.testId, this.step)
      .subscribe({
        next: (q: any) => {
          if (!q) {
            this.questionId = undefined;
            this.questionForm.reset({
              difficultyLevel: 'MEDIUM',
              timeLimit: 120,
              category: 'GENERAL'
            });
            return;
          }

          // Question exists → edit mode
          this.questionId = q.questionId || q.id;
          this.questionForm.patchValue({
            questionText: q.questionText,
            timeLimit: q.timeLimit,
            difficultyLevel: q.difficultyLevel,
            category: q.category
          });
          this.cdr.detectChanges();
        },
        error: () => {
          // No question at this step yet
          this.questionId = undefined;
        }
      });
  }

  /** Save or update question */
  saveQuestion(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      alert('❌ Please fill all required fields');
      return;
    }

    const payload = {
      ...this.questionForm.value,
      questionOrder: this.step
    };

    // Update existing question
    if (this.questionId) {
      this.service.updateQuestion(this.testId, this.step, payload)
        .subscribe(() => {
          alert('✅ Question Updated');
        });
      return;
    }

    // Create new question
    this.service.addQuestion(this.testId, payload)
      .subscribe((res: any) => {
        alert('✅ Question Created');
        this.questionId = res.questionId || res.id;
        this.cdr.detectChanges();
      });
  }

  /** Navigate to next step */
  nextStep(): void {
    if (this.step >= this.totalQuestions) {
      alert('✅ Communication Test Completed!');
      this.router.navigate(['/dashboard/creator']);
      return;
    }

    this.router.navigate(
      ['/creator/communication/test', this.testId],
      { queryParams: { step: this.step + 1 } }
    );
  }

  /** Navigate to previous step */
  previousStep(): void {
    if (this.step <= 1) return;

    this.router.navigate(
      ['/creator/communication/test', this.testId],
      { queryParams: { step: this.step - 1 } }
    );
  }
}
