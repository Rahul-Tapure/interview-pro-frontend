// login.component.ts
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

interface LoginApiData {
  redirectTo?: string;
  roles?: string[];
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  readonly invalidCredentialsMessage = 'Invalid email or password';
  showPassword = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const loginData = this.loginForm.getRawValue();

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.applyUiState(() => {
          this.loading = false;

          const typedResponse = response as ApiResponse<LoginApiData>;

          if (typedResponse?.success === false) {
            this.errorMessage = this.invalidCredentialsMessage;
            return;
          }

          const redirectFromApi = typedResponse?.data?.redirectTo;
          const roles = typedResponse?.data?.roles ?? [];

          if (redirectFromApi) {
            this.router.navigate([redirectFromApi]);
            return;
          }

          if (roles.includes('ROLE_CREATOR')) {
            this.router.navigate(['/dashboard/creator']);
            return;
          }

          if (roles.includes('ROLE_STUDENT')) {
            this.router.navigate(['/dashboard/user']);
            return;
          }

          this.router.navigate(['/home']);
        });
      },
      error: (err) => {
        this.applyUiState(() => {
          this.loading = false;
          this.errorMessage = this.invalidCredentialsMessage;
        });
        console.error('Login failed', err);
      }
    });
  }

  private applyUiState(updateFn: () => void): void {
    updateFn();
    this.cdr.detectChanges();
  }

  clearErrorMessage(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  get f() {
    return this.loginForm.controls;
  }
}