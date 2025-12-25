import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * 🚫 Guard que impide el acceso a rutas como /login o /register si el usuario ya está autenticado.
 */
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

 
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('');
      return false; // No se permite el acceso a la ruta (ej. /login)
    }

    // Usuario no autenticado, permitir acceso
    return true;
  }
}
