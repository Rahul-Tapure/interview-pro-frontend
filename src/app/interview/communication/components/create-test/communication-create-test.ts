// communication-create-test.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-communication-create-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './communication-create-test.html',
  styleUrls: ['./communication-create-test.css']
})
export class CommunicationCreateTestComponent implements OnInit {

  testForm!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.testForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      durationMinutes: [30, [Validators.required, Validators.min(5), Validators.max(180)]],
      totalQuestions: [10, [Validators.required, Validators.min(1), Validators.max(50)]]
    });
  }

  createTest(): void {
    if (this.testForm.invalid) {
      this.testForm.markAllAsTouched();
      this.error = 'Please fill all required fields correctly';
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.post('http://localhost:8080/interviewpro/communication/create', this.testForm.value)
      .subscribe({
        next: (res: any) => {
          // Navigate to edit page to add questions
          this.router.navigate(['/creator/communication/edit', res.id], {
            queryParams: { step: 1 }
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Failed to create test. Please try again.';
        }
      });
  }
}
