import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  of,
  tap
} from 'rxjs';

interface CurrentUser {
  id: number;
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private BASE_URL = 'http://localhost:8080/interviewpro/entry/v1';

  private authInitializedSubject = new BehaviorSubject<boolean>(false);
authInitialized$ = this.authInitializedSubject.asObservable();


  /* ================= AUTH STATE ================= */

  private authState$ = new BehaviorSubject<boolean>(false);
  readonly authStatus$ = this.authState$.asObservable();

  /* ================= USER STATE ================= */

  private userSubject = new BehaviorSubject<CurrentUser | null>(null);
  readonly user$ = this.userSubject.asObservable();

  // 🔥 THIS WAS MISSING
  private currentUser: CurrentUser | null = null;

  constructor(private http: HttpClient) {}

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
    return this.http.post(
      `${this.BASE_URL}/login`,
      data,
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.authState$.next(true);
        this.loadMe().subscribe(); // 🔥 load roles immediately
      })
    );
  }

  /* ================= LOGOUT ================= */

  logout() {
    this.authState$.next(false);
    this.currentUser = null;
    this.userSubject.next(null);

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

}
