import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, of, switchMap } from 'rxjs';

export const creatorGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authInitialized$.pipe(
    filter(init => init), // wait for auth check
    switchMap(() =>
      authService.user$.pipe(
        filter(user => user !== null), // 🔥 wait until user is loaded
        map(() => {
          if (authService.isCreator()) {
            return true;
          }

          router.navigate(['/unauthorized'], { replaceUrl: true });
          return false;
        })
      )
    )
  );
};
