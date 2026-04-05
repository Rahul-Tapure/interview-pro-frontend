import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  of,
  tap
} from 'rxjs';
import { environment } from '../../environments/environment';

interface CurrentUser {
  id: number;
  email: string;
  roles: string[];
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface RegisterPayload {
  email: string;
  password: string;
  role: string;
}

interface RegisterVerifyPayload extends RegisterPayload {
  otp: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  // Always use full backend URL from environment
  private BASE_URL = `${environment.apiUrl}/interviewpro/entry/v1`;

  private authInitializedSubject = new BehaviorSubject<boolean>(false);
authInitialized$ = this.authInitializedSubject.asObservable();


  /* ================= AUTH STATE ================= */

  private authState$ = new BehaviorSubject<boolean>(false);
  readonly authStatus$ = this.authState$.asObservable();

  /* ================= USER STATE ================= */

  private userSubject = new BehaviorSubject<CurrentUser | null>(null);
  readonly user$ = this.userSubject.asObservable();

  // 🔥 Store token as backup for cookie persistence issues
  private authToken: string | null = null;

  // 🔥 THIS WAS MISSING
  private currentUser: CurrentUser | null = null;

  constructor(private http: HttpClient) {
    // 🔥 Restore token from localStorage on app startup
    this.restoreToken();
  }

  /* ================= TOKEN RESTORATION ================= */

  private restoreToken(): void {
    const token = localStorage.getItem('entrypasstoken');
    if (token) {
      this.authToken = token;
    }
  }

  /* ================= AUTH CHECK ================= */

isAuthenticated() {
  return this.http.get(
    `${this.BASE_URL}/isValid`,
    { withCredentials: true }
  ).pipe(
    map(() => true),
    catchError(() => of(false)),
    tap(isAuth => {
      this.authState$.next(isAuth);
      this.authInitializedSubject.next(true);

      if (!isAuth) {
        this.currentUser = null;
        this.userSubject.next(null);
      }
    })
  );
}


  /* ================= LOGIN ================= */

  login(data: { email: string; password: string }) {
    return this.http.post<ApiResponse>(
      `${this.BASE_URL}/login`,
      data,
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        // If backend includes a success flag, respect it before mutating auth state.
        if (response?.success === false) {
          return;
        }

        // 🔥 Store token if returned in response (for backup if cookie fails)
        const token = (response as any)?.data?.token || (response as any)?.token;
        if (token) {
          this.authToken = token;
          localStorage.setItem('entrypasstoken', token);
        }

        this.authState$.next(true);
        this.loadMe().subscribe(); // 🔥 load roles immediately
      })
    );
  }

  /* ================= LOGOUT ================= */

  logout() {
    this.authState$.next(false);
    this.authToken = null;
    this.currentUser = null;
    this.userSubject.next(null);
    localStorage.removeItem('entrypasstoken');

    return this.http.post(
      `${this.BASE_URL}/logout`,
      {},
      { withCredentials: true }
    );
  }

  /* ================= USER / ROLE ================= */

  loadMe() {
    return this.getMe().pipe(
      tap(user => {
        this.currentUser = user;        // 🔥 sync storage
        this.userSubject.next(user);
      }),
      catchError(() => {
        this.currentUser = null;
        this.userSubject.next(null);
        return of(null);
      })
    );
  }

  getMe() {
    return this.http.get<CurrentUser>(
      `${this.BASE_URL}/me`,
      { withCredentials: true }
    );
  }

  /* ================= ROLE CHECK ================= */

  hasRole(role: string): boolean {
    const roles = this.currentUser?.roles ?? [];

    // direct role
    if (roles.includes(role)) {
      return true;
    }

    // 🔥 frontend role hierarchy mirror
    if (role === 'ROLE_STUDENT' && roles.includes('ROLE_CREATOR')) {
      return true;
    }

    return false;
  }

  isStudent(): boolean {
    return this.hasRole('ROLE_STUDENT');
  }

  isCreator(): boolean {
    return this.hasRole('ROLE_CREATOR');
  }

  getUserId(): number | null {
    return this.currentUser?.id ?? null;
  }


  register(data: { email: string; password: string; role: string }) {
  return this.http.post(
    `${this.BASE_URL}/register`,
    data,
    { withCredentials: true }
  );
}

  requestRegisterOtp(data: RegisterPayload) {
    return this.http.post<ApiResponse>(
      `${this.BASE_URL}/register/request-otp`,
      data,
      { withCredentials: true }
    );
  }

  verifyRegisterOtp(data: RegisterVerifyPayload) {
    return this.http.post<ApiResponse>(
      `${this.BASE_URL}/register/verify-otp`,
      data,
      { withCredentials: true }
    );
  }

  requestPasswordReset(email: string) {
    return this.http.post(
      `${this.BASE_URL}/forgot-password`,
      { email }
    );
  }

  resetPassword(data: { token: string; newPassword: string }) {
    return this.http.post(
      `${this.BASE_URL}/reset-password`,
      data
    );
  }

  requestPasswordChangeOtp(email: string) {
    return this.http.post(
      `${this.BASE_URL}/password-change/request-otp`,
      { email },
      { withCredentials: true }
    );
  }

  verifyPasswordChangeOtp(data: { email: string; otp: string; newPassword: string }) {
    return this.http.post(
      `${this.BASE_URL}/password-change/verify-otp`,
      data,
      { withCredentials: true }
    );
  }

  requestEmailChangeOtp(newEmail: string) {
    return this.http.post(
      `${this.BASE_URL}/email-change/request-otp`,
      { newEmail },
      { withCredentials: true }
    );
  }

  verifyEmailChangeOtp(data: { newEmail: string; otp: string }) {
    return this.http.post(
      `${this.BASE_URL}/email-change/verify-otp`,
      data,
      { withCredentials: true }
    );
  }

}
