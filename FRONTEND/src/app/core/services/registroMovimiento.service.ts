import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { RegistroMovimiento, RegistroMovimientoResponse } from '../models/registroMovimiento';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistroMovimientoService {

  private apiUrl = `${environment.apiUrl}/movimientos`
  constructor(private http: HttpClient) { }

  obtenerMovimientos(): Observable<RegistroMovimientoResponse> {
    return this.http.get<RegistroMovimientoResponse>(this.apiUrl);
  }

  obtenerMovimientoPorId(id: number): Observable<RegistroMovimientoResponse> {
    return this.http.get<RegistroMovimientoResponse>(`${this.apiUrl}/${id}`);
  }

  crearMovimiento(movimiento: RegistroMovimiento): Observable<RegistroMovimientoResponse> {
    return this.http.post<RegistroMovimientoResponse>(this.apiUrl, movimiento);
  }

  actualizarMovimiento(id: number, movimiento: RegistroMovimiento): Observable<RegistroMovimientoResponse> {
    return this.http.put<RegistroMovimientoResponse>(`${this.apiUrl}/${id}`, movimiento);
  }

  eliminarMovimiento(id: number): Observable<RegistroMovimientoResponse> {
    return this.http.delete<RegistroMovimientoResponse>(`${this.apiUrl}/${id}`);
  }
}