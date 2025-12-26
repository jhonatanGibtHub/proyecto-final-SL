import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-app-router',
  imports: [
    UserMenuComponent,
    RouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkWithHref,
    RouterLinkActive
],
  templateUrl: './app-router.component.html',
  styleUrl: './app-router.component.css'
})
export class AppRouterComponent {

  sidebarCollapsed = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const saved = localStorage.getItem('sidebarCollapsed');
    this.sidebarCollapsed = saved === 'true';
  }

  disableInitialTransition = true;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());

  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
