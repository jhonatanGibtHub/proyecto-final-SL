import { Component } from '@angular/core';
import { ButtonColorThemeComponent } from '../button-color-theme/button-color-theme.component';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-header-web',
  imports: [
    RouterLink
  ],
  templateUrl: './header-web.component.html',
  styleUrl: './header-web.component.css'
})
export class HeaderWebComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  goToApp(): void {
    if (this.authService.isAuthenticated()) {
      // Usuario logueado → app
      this.router.navigate(['/app']);
    } else {
      // Usuario NO logueado → login
      this.router.navigate(['/auth/login']);
    }
  }
}
