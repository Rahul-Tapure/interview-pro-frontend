import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  // Check if it's an API request (relative path OR full backend URL)
  const isAppApiRequest = req.url.startsWith('/interviewpro') || 
                         req.url.startsWith('/api') || 
                         req.url.includes('interview-pro-backend') ||
                         req.url.includes('onrender.com');

  // Send credentials to all application APIs
  let authReq = isAppApiRequest
    ? req.clone({ withCredentials: true })
    : req;

  // 🔥 Also try to add token from localStorage if available (for cross-origin/cookie-blocking scenarios)
  if (isAppApiRequest) {
    const token = localStorage.getItem('entrypasstoken');
    if (token) {
      authReq = authReq.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  }

  return next(authReq).pipe(
    catchError(err => {

      if (err.status === 401 || err.status === 403) {
        // 🔐 Session expired / invalid / unauthorized - redirect to login
        router.navigate(['/login']);
      }

      return throwError(() => err);
    })
  );
};
