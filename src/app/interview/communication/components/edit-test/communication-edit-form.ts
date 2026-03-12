// communication-edit-form.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunicationService } from '../../services/communication.service';

@Component({
  selector: 'app-communication-edit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './communication-edit-form.html',
  styleUrls: ['./communication-edit-test.css']
})
export class CommunicationEditFormComponent implements OnInit {

  testId!: number;
  testForm!: FormGroup;
  loading = true;
  saving = false;
  error = '';
  message = '';
  currentStep = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('testId'));
    this.testForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      questions: this.fb.array([])
    });
    this.loadTest();
  }

  get questions(): FormArray {
    return this.testForm.get('questions') as FormArray;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  loadTest(): void {
    this.loading = true;
    this.communicationService.getTest(this.testId).subscribe({
      next: (res: any) => {
        this.testForm.patchValue({
          title: res.title,
          description: res.description
        });
        this.questions.clear();
        (res.questions || []).forEach((q: any, i: number) => {
          this.questions.push(this.fb.group({
            id: [q.id || null],
            questionText: [q.questionText, [Validators.required, Validators.minLength(10)]],
            timeLimit: [q.timeLimit || 120, [Validators.required, Validators.min(30), Validators.max(600)]],
            questionOrder: [i + 1],
            difficultyLevel: [q.difficultyLevel || 'MEDIUM'],
            category: [q.category || '']
          }));
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load test.';
        this.cdr.detectChanges();
      }
    });
  }

  addQuestion(): void {
    this.questions.push(this.fb.group({
      id: [null],
      questionText: ['', [Validators.required, Validators.minLength(10)]],
      timeLimit: [120, [Validators.required, Validators.min(30), Validators.max(600)]],
      questionOrder: [this.questions.length + 1],
      difficultyLevel: ['MEDIUM'],
      category: ['']
    }));
    this.currentStep = this.questions.length;
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
    this.questions.controls.forEach((ctrl, i) => {
      ctrl.get('questionOrder')?.setValue(i + 1);
    });
    if (this.currentStep > this.questions.length) {
      this.currentStep = this.questions.length;
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  nextStep(): void {
    if (this.currentStep === 0) {
      const titleCtrl = this.testForm.get('title');
      if (titleCtrl?.invalid) {
        titleCtrl.markAsTouched();
        this.error = 'Please enter a test title';
        return;
      }
      this.error = '';
      if (this.questions.length === 0) {
        this.addQuestion();
      } else {
        this.currentStep = 1;
      }
    } else if (this.currentStep < this.questions.length) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  saveTest(): void {
    if (this.testForm.invalid || this.questions.length === 0) {
      this.testForm.markAllAsTouched();
      this.error = 'Please fill all required fields and add at least one question';
      return;
    }

    this.saving = true;
    this.error = '';

    const payload = {
      title: this.testForm.value.title,
      description: this.testForm.value.description,
      questions: this.testForm.value.questions
    };

    this.communicationService.updateTest(this.testId, payload)
      .subscribe({
        next: () => {
          this.saving = false;
          this.message = 'Test updated successfully!';
          setTimeout(() => this.router.navigate(['/dashboard/creator']), 1500);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Failed to update test. Please try again.';
          this.cdr.detectChanges();
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/creator']);
  }
}
