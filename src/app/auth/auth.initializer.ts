import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export function authInitializer(authService: AuthService) {
  return () => firstValueFrom(authService.isAuthenticated());
}
