import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-header-web',
  imports: [],
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
