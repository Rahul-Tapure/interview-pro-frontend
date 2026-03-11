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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
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

}
