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
    this.loadUserFromStorage();
  }

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

  registro(datos: RegistroRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, datos);
  }

  obtenerPerfil(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/perfil`);
  }

  verificarToken(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/verificar`);
  }

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

  getUsername(): string | null {
    return this.getCurrentUser()?.nombre ?? null;
  }

  getPicture(): string | null {
    return this.getCurrentUser()?.picture ?? null;
  }

  private loadUserFromStorage(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      try {
        const usuario = JSON.parse(usuarioString);
        this.currentUserSubject.next(usuario);
      } catch (error) {
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

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

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const usuario = this.getCurrentUser();
    return usuario?.rol === 'admin';
  }
  
}