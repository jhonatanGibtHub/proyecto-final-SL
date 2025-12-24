import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component';
import { ButtonColorThemeComponent } from '../../shared/button-color-theme/button-color-theme.component';

@Component({
  selector: 'app-app-router',
  imports: [
    UserMenuComponent,
    RouterOutlet,
    CommonModule,
    RouterLink
  ],
  templateUrl: './app-router.component.html',
  styleUrl: './app-router.component.css'
})
export class AppRouterComponent {
  sidebarCollapsed = false;

  ngOnInit() {
    const saved = localStorage.getItem('sidebarCollapsed');
    this.sidebarCollapsed = saved === 'true';
  }

  disableInitialTransition = true;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());

  }
}
