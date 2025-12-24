import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-user-menu',
  imports: [
    CommonModule
  ],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent {
  isOpen = false;
  picture: string | null = localStorage.getItem('userPicture');
  username: string | null = localStorage.getItem('username');

  constructor(
    private authService: AuthService

  ) {

    this.username = this.authService.getUsernameFromToken();

  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  goToProfile(): void {
    this.isOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isOpen = false;
  }

  // Cierra el menú si se hace click fuera
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isOpen = false;
    }
  }
}
