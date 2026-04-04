import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-email-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './change-email-otp.component.html',
  styleUrl: './change-email-otp.component.css'
})
export class ChangeEmailOtpComponent {

  requestForm: FormGroup;
  verifyForm: FormGroup;

  otpSent = false;
  loadingRequest = false;
  loadingVerify = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]]
    });

    this.verifyForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  requestOtp(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.loadingRequest = true;
    this.successMessage = '';
    this.errorMessage = '';

    const newEmail = this.requestForm.getRawValue().newEmail;

    this.authService.requestEmailChangeOtp(newEmail).subscribe({
      next: () => {
        this.loadingRequest = false;
        this.otpSent = true;
        this.verifyForm.patchValue({ newEmail });
        this.successMessage = 'OTP sent for email change verification.';
      },
      error: (err: unknown) => {
        const apiError = err as { error?: { message?: string } };
        this.loadingRequest = false;
        this.errorMessage = apiError?.error?.message || 'Unable to send OTP right now.';
      }
    });
  }

  verifyAndChangeEmail(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.loadingVerify = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = this.verifyForm.getRawValue();

    this.authService.verifyEmailChangeOtp(payload).subscribe({
      next: () => {
        this.loadingVerify = false;
        this.successMessage = 'Email updated. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: unknown) => {
        const apiError = err as { error?: { message?: string } };
        this.loadingVerify = false;
        this.errorMessage = apiError?.error?.message || 'Invalid or expired OTP.';
      }
    });
  }

  get rf() {
    return this.requestForm.controls;
  }

  get vf() {
    return this.verifyForm.controls;
  }
}
