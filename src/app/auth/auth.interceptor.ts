import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const isAppApiRequest = req.url.startsWith('/interviewpro') || req.url.startsWith('/api');

  // Send credentials only to application APIs to avoid leaking cookies on third-party requests.
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
