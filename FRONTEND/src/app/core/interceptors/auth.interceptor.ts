import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ){}
    
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Si hay token, clona la solicitud original y agrega el encabezado Authorization
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // Encabezado estándar para autenticación JWT
        }
      });

      // Continúa el flujo de la solicitud con la versión modificada
      return next.handle(authReq);
    }

    // Si no hay token, se envía la solicitud original sin modificar
    return next.handle(req);
  }
}
