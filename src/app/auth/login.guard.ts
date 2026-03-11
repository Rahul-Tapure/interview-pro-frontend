import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const loginGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authStatus$.pipe(
    map(isAuth => {

      // ✅ If already logged in, block login/register
      if (isAuth) {
        router.navigate(['/home'], { replaceUrl: true });
        return false;
      }

      // ✅ Logged out users may access login/register
      return true;
    })
  );
};
