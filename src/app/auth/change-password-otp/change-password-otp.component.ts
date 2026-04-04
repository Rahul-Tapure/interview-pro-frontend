import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './change-password-otp.component.html',
  styleUrl: './change-password-otp.component.css'
})
export class ChangePasswordOtpComponent implements OnInit {

  requestForm: FormGroup;
  verifyForm: FormGroup;

  otpSent = false;
  loadingRequest = false;
  loadingVerify = false;
  successMessage = '';
  errorMessage = '';
  pageTitle = 'Change Password (OTP)';
  pageSubtitle = 'Request OTP, then verify OTP to update your password.';
  backRoute = '/dashboard/user';
  backLabel = 'Back to Dashboard';

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.verifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(4)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email') || '';
    const source = this.route.snapshot.queryParamMap.get('source') || '';
    const otpSent = this.route.snapshot.queryParamMap.get('otpSent') === 'true';

    if (email) {
      this.requestForm.patchValue({ email });
      this.verifyForm.patchValue({ email });
    }

    if (source === 'forgot-password') {
      this.pageTitle = 'Verify OTP & Set New Password';
      this.pageSubtitle = 'Enter the OTP sent to your email and choose a new password.';
      this.backRoute = '/login';
      this.backLabel = 'Back to Login';
      this.otpSent = otpSent;
    }
  }

  requestOtp(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.loadingRequest = true;
    this.successMessage = '';
    this.errorMessage = '';

    const email = this.requestForm.getRawValue().email;

    this.authService.requestPasswordChangeOtp(email).subscribe({
      next: () => {
        this.loadingRequest = false;
        this.otpSent = true;
        this.verifyForm.patchValue({ email });
        this.successMessage = 'OTP sent to your email.';
      },
      error: (err: unknown) => {
        const apiError = err as { error?: { message?: string } };
        this.loadingRequest = false;
        this.errorMessage = apiError?.error?.message || 'Unable to send OTP right now.';
      }
    });
  }

  verifyAndChangePassword(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword, email, otp } = this.verifyForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loadingVerify = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.verifyPasswordChangeOtp({ email, otp, newPassword }).subscribe({
      next: () => {
        this.loadingVerify = false;
        this.successMessage = 'Password changed successfully.';
        this.verifyForm.reset();
        this.requestForm.reset();
        this.otpSent = false;
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
