// register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  roles = [
    {
      label: 'Student',
      value: 'STUDENT',
      icon: '🎓',
      desc: 'Take tests & practice'
    },
    {
      label: 'Creator',
      value: 'CREATOR',
      icon: '✏️',
      desc: 'Create & manage tests'
    }
  ];

  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      role:     ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get passwordStrength(): { pct: number; label: string; cls: string } {
    const val: string = this.f['password'].value ?? '';
    const len = val.length;
    if (len === 0)        return { pct: 0,   label: '',       cls: '' };
    if (len < 6)          return { pct: 33,  label: 'Weak',   cls: 'weak' };
    if (len < 10)         return { pct: 66,  label: 'Medium', cls: 'medium' };
    return               { pct: 100, label: 'Strong', cls: 'strong' };
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const data = this.registerForm.getRawValue();

    this.authService.register(data).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  get f() {
    return this.registerForm.controls;
  }
}