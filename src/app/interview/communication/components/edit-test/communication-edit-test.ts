// communication-edit-test.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-communication-edit-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './communication-edit-test.html',
  styleUrls: ['./communication-edit-test.css']
})
export class CommunicationEditTestComponent implements OnInit {

  questionForm!: FormGroup;
  testId!: number;
  step!: number;
  totalQuestions!: number;
  questionId?: number;
  test: any;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Get params
    this.testId = Number(this.route.snapshot.paramMap.get('testId'));
    this.step = Number(this.route.snapshot.queryParamMap.get('step')) || 1;

    // Load test details
    this.http.get(`http://localhost:8080/interviewpro/communication/test/${this.testId}`)
      .subscribe((res: any) => {
        this.test = res;
        this.totalQuestions = res.totalQuestions;
      });

    // Initialize form
    this.questionForm = this.fb.group({
      questionText: ['', [Validators.required, Validators.minLength(10)]],
      expectedPoints: [''],
      timeLimit: [120, [Validators.required, Validators.min(30), Validators.max(600)]]
    });

    // Watch for step changes
    this.route.queryParamMap.subscribe(params => {
      this.step = Number(params.get('step')) || 1;
      this.loadQuestionForStep();
    });
  }

  /** Load existing question for current step */
  loadQuestionForStep(): void {
    this.http.get(`http://localhost:8080/interviewpro/communication/question/${this.testId}/${this.step}`)
      .subscribe({
        next: (q: any) => {
          if (q) {
            this.questionId = q.id;
            this.questionForm.patchValue({
              questionText: q.questionText,
              expectedPoints: q.expectedPoints,
              timeLimit: q.timeLimit
            });
          } else {
            // No question exists for this step - create mode
            this.questionId = undefined;
            this.questionForm.reset({ timeLimit: 120 });
          }
        },
        error: () => {
          // Question doesn't exist yet
          this.questionId = undefined;
          this.questionForm.reset({ timeLimit: 120 });
        }
      });
  }

  /** Save or update question */
  saveQuestion(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      this.error = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    this.error = '';

    const payload = {
      ...this.questionForm.value,
      testId: this.testId,
      questionIndex: this.step
    };

    const request = this.questionId
      ? this.http.put(`http://localhost:8080/interviewpro/communication/question/${this.questionId}`, payload)
      : this.http.post('http://localhost:8080/interviewpro/communication/question', payload);

    request.subscribe({
      next: (res: any) => {
        this.loading = false;
        this.questionId = res.id;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to save question';
      }
    });
  }

  /** Navigate to next step */
  nextStep(): void {
    if (this.step >= this.totalQuestions) {
      // Finished - navigate to creator dashboard
      alert('✅ Communication test completed!');
      this.router.navigate(['/dashboard/creator']);
      return;
    }

    this.router.navigate(['/creator/communication/edit', this.testId], {
      queryParams: { step: this.step + 1 }
    });
  }

  /** Navigate to previous step */
  previousStep(): void {
    if (this.step <= 1) return;

    this.router.navigate(['/creator/communication/edit', this.testId], {
      queryParams: { step: this.step - 1 }
    });
  }
}
