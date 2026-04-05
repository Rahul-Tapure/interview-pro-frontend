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
  const authReq = isAppApiRequest
    ? req.clone({ withCredentials: true })
    : req;

  return next(authReq).pipe(
    catchError(err => {

      if (err.status === 401) {
        // 🔐 Session expired / invalid
        router.navigate(['/login']);
      }

      return throwError(() => err);
    })
  );
};
