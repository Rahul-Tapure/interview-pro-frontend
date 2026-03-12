// add-test.ts (or coding-test-builder.ts)
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CodingCreatorService } from '../../service/coding-creator.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-test.html', // Use the redesigned template
  styleUrls: ['./add-test.css']
})
export class AddTestComponent implements OnInit {

  questionForm!: FormGroup;
  testCaseForm!: FormGroup;

  testId!: number;
  step!: number;
  totalQuestions!: number;

  questionId?: number;
  testCases: any[] = [];

  /** Difficulty options for the chip buttons */
  difficulties = [
    { value: 'EASY',   label: 'Easy',   emoji: '🟢' },
    { value: 'MEDIUM', label: 'Medium', emoji: '🟡' },
    { value: 'HARD',   label: 'Hard',   emoji: '🔴' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: CodingCreatorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get params
    this.testId = Number(this.route.snapshot.paramMap.get('testId'));
    this.step = Number(this.route.snapshot.queryParamMap.get('step')) || 1;

    // Load test to get total questions
    this.service.getTestById(this.testId).subscribe(test => {
      this.totalQuestions = test.totalQuestions;
      this.cdr.detectChanges();
    });

    // Initialize forms
    this.questionForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      difficulty: ['MEDIUM'], // Default to Medium
      constraints: [''],
      timeLimit: [2],
      memoryLimit: [256]
    });

    this.testCaseForm = this.fb.group({
      input: ['', Validators.required],
      expectedOutput: ['', Validators.required],
      sample: [true]
    });

    // Watch for step changes in query params
    this.route.queryParamMap.subscribe(params => {
      this.step = Number(params.get('step')) || 1;

      // Hard reset before loading new data
      this.questionId = undefined;
      this.testCases = [];

      this.questionForm.reset({
        difficulty: 'MEDIUM',
        timeLimit: 2,
        memoryLimit: 256
      });

      this.testCaseForm.reset({ sample: true });

      // Load data for this step
      this.loadStepData();
    });
  }

  /** Load question data for current step */
  loadStepData(): void {
    this.service.getQuestionByStep(this.testId, this.step)
      .subscribe((q: any) => {
        // No question exists → Create mode
        if (!q) {
          this.questionId = undefined;
          this.testCases = [];
          this.questionForm.reset({
            difficulty: 'MEDIUM',
            timeLimit: 2,
            memoryLimit: 256
          });
          return;
        }

        // Question exists → Edit mode
        this.questionId = q.questionId;

        this.questionForm.patchValue({
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          constraints: q.constraints,
          timeLimit: q.timeLimit,
          memoryLimit: q.memoryLimit
        });

        // Load test cases
        this.loadTestCases();
        this.cdr.detectChanges();
      });
  }

  /** Save or update question */
  saveQuestion(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      alert('❌ Please fill all required fields');
      return;
    }

    // Update existing question
    if (this.questionId) {
      this.service.updateQuestion(this.questionId, this.questionForm.value)
        .subscribe(() => {
          alert('✅ Question Updated');
        });
      return;
    }

    // Create new question
    this.service.createQuestion(
      this.testId,
      this.step,
      this.questionForm.value
    ).subscribe((res: any) => {
      alert('✅ Question Created');
      this.questionId = res.questionId;
      this.loadTestCases();
    });
  }

  /** Load test cases for current question */
  loadTestCases(): void {
    if (!this.questionId) return;

    this.service.getTestCases(this.questionId)
      .subscribe((res: any) => {
        this.testCases = res;
        this.cdr.detectChanges();
      });
  }

  /** Add new test case */
  addTestCase(): void {
    if (!this.questionId) {
      alert('❌ Save the question first before adding test cases!');
      return;
    }

    if (this.testCaseForm.invalid) {
      this.testCaseForm.markAllAsTouched();
      alert('❌ Please fill input and expected output');
      return;
    }

    this.service.addTestCase(this.questionId, this.testCaseForm.value)
      .subscribe(() => {
        this.testCaseForm.reset({ sample: true });
        this.loadTestCases();
      });
  }

  /** Delete test case */
  deleteTestCase(id: number): void {
    if (!confirm('Delete this test case?')) return;

    this.service.deleteTestCase(id)
      .subscribe(() => this.loadTestCases());
  }

  /** Navigate to next step */
  nextStep(): void {
    if (this.step >= this.totalQuestions) {
      alert('✅ Coding Test Completed!');
      this.router.navigate(['/dashboard/creator']);
      return;
    }

    this.router.navigate([
      '/creator/coding/test',
      this.testId
    ], {
      queryParams: { step: this.step + 1 }
    });
  }

  /** Navigate to previous step */
  previousStep(): void {
    if (this.step <= 1) return;

    this.router.navigate([
      '/creator/coding/test',
      this.testId
    ], {
      queryParams: { step: this.step - 1 }
    });
  }
}