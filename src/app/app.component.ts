import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  dropdownOpen = false;
  isLoggedIn$!: Observable<boolean>;
  randomAvatarUrl: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Generate avatar once per session
    this.randomAvatarUrl = this.generateRandomAvatar();
  }
ngOnInit(): void {
  this.isLoggedIn$ = this.authService.authStatus$;

  // 🔥 restore auth + load roles on refresh
  this.authService.isAuthenticated().subscribe(isAuth => {
    if (isAuth) {
      this.authService.loadMe().subscribe();
    }
  });
}


  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }
logout() {
  console.log("logout called");
  this.authService.logout().subscribe({
    next: () => {
      this.dropdownOpen = false;
      this.router.navigate(['/login'], { replaceUrl: true });
    },
    error: (err) => {
      console.error('Logout failed', err);
    }
  });
}

hasUserRole(): boolean {
  return this.authService.hasRole('ROLE_STUDENT');
}

hasCreatorRole(): boolean {
  return this.authService.hasRole('ROLE_CREATOR');
}

generateRandomAvatar(): string {
  // Generate random color for avatar background
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA502', '6C5CE7', 'A29BFE', '00B894', 'FDCB6E', 'E17055', 'D63031'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomId = Math.random().toString(36).substring(7);
  // Using DiceBear avatars service for random avatars
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomId}&backgroundColor=${randomColor}`;
}

onImageError(event: any): void {
  // On image load error, use the pre-generated random avatar
  if (event.target.src !== this.randomAvatarUrl) {
    event.target.src = this.randomAvatarUrl;
  }
}

}
