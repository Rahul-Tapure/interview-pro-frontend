// ✔️ Protects authenticated routes
// ✔️ Uses local auth state (no backend calls here)
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map } from 'rxjs';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authInitialized$.pipe(
    filter(init => init), // 🔥 wait until auth check completes
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }

      router.navigate(['/login'], { replaceUrl: true });
      return false;
    })
  );
};
