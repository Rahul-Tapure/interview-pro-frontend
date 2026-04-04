import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface ForgotPasswordApiData {
  token?: string;
  resetToken?: string;
  redirectTo?: string;
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  token?: string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  form: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const email = this.form.getRawValue().email;

    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.applyUiState(() => {
          this.loading = false;

          const typedResponse = response as ApiResponse<ForgotPasswordApiData>;

          if (typedResponse?.success === false) {
            this.errorMessage = typedResponse?.message || 'Unable to process request right now. Please try again.';
            return;
          }

          const redirectTo = typedResponse?.data?.redirectTo;
          const token = typedResponse?.data?.token || typedResponse?.data?.resetToken || typedResponse?.token;

          if (typedResponse?.data?.redirectTo == null && !token) {
            this.successMessage = 'OTP sent successfully ✔';
            setTimeout(() => {
              this.router.navigate(['/forgot-password/verify-otp'], {
                queryParams: {
                  email,
                  source: 'forgot-password',
                  otpSent: 'true'
                }
              });
            }, 900);
            return;
          }

          if (redirectTo) {
            this.router.navigate([redirectTo]);
            return;
          }

          if (token) {
            this.router.navigate(['/reset-password'], {
              queryParams: { token }
            });
            return;
          }

          this.successMessage = typedResponse?.message || 'OTP sent successfully ✔';
        });
      },
      error: (err: unknown) => {
        const apiError = err as { error?: { message?: string } };
        this.applyUiState(() => {
          this.loading = false;
          this.errorMessage = apiError?.error?.message || 'Unable to process request right now. Please try again.';
        });
      }
    });
  }

  private applyUiState(updateFn: () => void): void {
    updateFn();
    this.cdr.detectChanges();
  }

  get f() {
    return this.form.controls;
  }
}
