import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export function authInitializer(authService: AuthService) {
  return async () => {
    try {
      // Check if user is authenticated on app startup
      const isAuth = await firstValueFrom(authService.isAuthenticated());
      
      // Only try to load user if authenticated
      if (isAuth) {
        await firstValueFrom(authService.loadMe());
      }
    } catch (error) {
      console.warn('Auth initialization failed (may be expected):', error);
      // Continue app startup - user will see login page if not authenticated
    }
  };
}
