import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { switchMap, map, of } from 'rxjs';

export const roleRedirectGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authStatus$.pipe(
    switchMap(isAuth => {

      // 🔥 If NOT authenticated, allow route evaluation to continue
      // authGuard will already handle redirect to /login
      if (!isAuth) {
        return of(true);
      }

      // ✅ Only authenticated users reach here
      return authService.getMe().pipe(
        map(user => {

          if (user.roles.includes('ROLE_STUDENT')) {
            router.navigate(['/user-dashboard'], { replaceUrl: true });
            return false;
          }

          if (user.roles.includes('ROLE_CREATOR')) {
            router.navigate(['/creator-dashboard'], { replaceUrl: true });
            return false;
          }

          // fallback safety
          router.navigate(['/login'], { replaceUrl: true });
          return false;
        })
      );
    })
  );
};
