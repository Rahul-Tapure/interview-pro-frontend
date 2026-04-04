import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  token = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const queryToken = this.route.snapshot.queryParamMap.get('token');
    const pathToken = this.route.snapshot.paramMap.get('token');
    this.token = queryToken || pathToken || '';

    if (!this.token) {
      this.errorMessage = 'Reset token is missing. Please use the link from your email.';
    }
  }

  submit(): void {
    if (!this.token) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.resetPassword({ token: this.token, newPassword }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Password reset successful. Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err: unknown) => {
        const apiError = err as { error?: { message?: string } };
        this.loading = false;
        this.errorMessage = apiError?.error?.message || 'Unable to reset password. Try requesting a new link.';
      }
    });
  }

  get f() {
    return this.form.controls;
  }
}
