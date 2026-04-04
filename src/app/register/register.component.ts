// register.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  otpForm!: FormGroup;
  otpSent = false;
  loading = false;
  errorMessage = '';
  otpErrorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      role:     ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4)]]
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

  requestOtp(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.otpErrorMessage = '';
    this.successMessage = '';

    const data = this.registerForm.getRawValue();

    this.authService.requestRegisterOtp(data).subscribe({
      next: (response) => {
        this.applyUiState(() => {
          this.loading = false;
          const typedResponse = response as { success?: boolean; message?: string };

          if (typedResponse?.success === false) {
            this.errorMessage = typedResponse?.message || 'Unable to send OTP. Please try again.';
            return;
          }

          this.otpSent = true;
          this.successMessage = typedResponse?.message || 'OTP sent to your email. Verify OTP to complete registration.';
        });
      },
      error: (err: any) => {
        this.applyUiState(() => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Unable to send OTP. Please try again.';
        });
      }
    });
  }

  verifyOtpAndRegister(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.otpErrorMessage = '';
    this.successMessage = '';

    const registerData = this.registerForm.getRawValue();
    const otp = this.otpForm.getRawValue().otp;

    this.authService.verifyRegisterOtp({ ...registerData, otp }).subscribe({
      next: (response) => {
        this.applyUiState(() => {
          this.loading = false;
          const typedResponse = response as { success?: boolean; message?: string };

          if (typedResponse?.success === false) {
            this.otpErrorMessage = typedResponse?.message || 'Invalid OTP. Please try again.';
            return;
          }

          this.successMessage = typedResponse?.message || 'Account created successfully. Redirecting to login...';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        });
      },
      error: (err: any) => {
        this.applyUiState(() => {
          this.loading = false;
          this.otpErrorMessage = err?.error?.message || 'OTP verification failed. Please try again.';
        });
      }
    });
  }

  private applyUiState(updateFn: () => void): void {
    updateFn();
    this.cdr.detectChanges();
  }

  editDetails(): void {
    this.otpSent = false;
    this.otpForm.reset();
    this.errorMessage = '';
    this.otpErrorMessage = '';
    this.successMessage = '';
  }

  selectRole(role: string): void {
    if (this.otpSent) {
      return;
    }
    this.registerForm.get('role')?.setValue(role);
  }

  clearOtpError(): void {
    if (this.otpErrorMessage) {
      this.otpErrorMessage = '';
    }
  }

  get of() {
    return this.otpForm.controls;
  }

  get f() {
    return this.registerForm.controls;
  }
}