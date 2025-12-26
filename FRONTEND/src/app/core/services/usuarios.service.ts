import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerUsuarios(): Observable<{ success: boolean; data: Usuario[] }> {
    return this.http.get<{ success: boolean; data: Usuario[] }>(`${this.apiUrl}/usuarios`, { headers: this.getHeaders() });
  }

  toggleActivoUsuario(id: number): Observable<{ success: boolean; mensaje: string }> {
    return this.http.put<{ success: boolean; mensaje: string }>(`${this.apiUrl}/usuarios/${id}/toggle-activo`, {}, { headers: this.getHeaders() });
  }

  cambiarRolUsuario(id: number, rol: 'admin' | 'usuario'): Observable<{ success: boolean; mensaje: string }> {
    return this.http.put<{ success: boolean; mensaje: string }>(`${this.apiUrl}/usuarios/${id}/rol`, { rol }, { headers: this.getHeaders() });
  }
}