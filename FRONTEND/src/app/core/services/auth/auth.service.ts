import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import {
  Usuario,
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  AuthResponse
} from '../../models/usuario.interface';
import { environment } from '../../../environment/environment';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../../models/jwt/JwtPayloadModel';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario del localStorage al iniciar
    this.loadUserFromStorage();
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.setSession(response);
          }
        })
      );
  }

  loginGoogle(idToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/google`, { idToken })
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.setSession(response);
          } else {
            throw { type: 'USER_NOT_FOUND', message: 'Usuario no encontrado' };
          }
        })
      );
  }

  /**
   * Registrar nuevo usuario
   */
  registro(datos: RegistroRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, datos);
  }



  /**
   * Obtener perfil del usuario autenticado
   */
  obtenerPerfil(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/perfil`);
  }



  /**
   * Verificar si el token es válido
   */
  verificarToken(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/verificar`);
  }



  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }


  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('usuario', JSON.stringify(authResult.usuario));
    this.currentUserSubject.next(authResult.usuario);
  }

  getUsernameFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nombre || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cargar usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      try {
        const usuario = JSON.parse(usuarioString);
        this.currentUserSubject.next(usuario);
      } catch (error) {
        console.error('Error al cargar usuario del localStorage:', error);
        this.logout();
      }
    }
  }

  /**
   * Obtener token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const ahora = Math.floor(Date.now() / 1000);
      return decoded.exp > ahora;
    } catch {
      return false;
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si es administrador
   */
  isAdmin(): boolean {
    const usuario = this.getCurrentUser();
    return usuario?.rol === 'admin';
  }
}