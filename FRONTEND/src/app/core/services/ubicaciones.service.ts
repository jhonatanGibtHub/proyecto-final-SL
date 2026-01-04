import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Ubicacion, UbicacionResponse } from '../models/ubicacion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UbicacionesService {

  private apiUrl = `${environment.apiUrl}/ubicaciones`
  constructor(private http: HttpClient) { }

  obtenerUbicaciones(): Observable<UbicacionResponse> {
    return this.http.get<UbicacionResponse>(this.apiUrl);
  }
  obtenerUbicacione_Clientes(): Observable<UbicacionResponse> {
    return this.http.get<UbicacionResponse>(this.apiUrl +'/clientes');
  }
  obtenerUbicacione_Distribudor(): Observable<UbicacionResponse> {
    return this.http.get<UbicacionResponse>(this.apiUrl +'/distribuidores');
  }

  

  
  obtenerUbicacionPorId(id: number): Observable<UbicacionResponse> {
    return this.http.get<UbicacionResponse>(`${this.apiUrl}/${id}`);
  }

  eliminarUbicacion(id: number): Observable<UbicacionResponse> {
    return this.http.delete<UbicacionResponse>(`${this.apiUrl}/${id}`);
  }

  crearUbicacion(ubicacion: Ubicacion): Observable<UbicacionResponse> {
    return this.http.post<UbicacionResponse>(this.apiUrl, ubicacion);
  }

  actualizarUbicacion(id: number, ubicacion: Ubicacion): Observable<UbicacionResponse> {
    return this.http.put<UbicacionResponse>(`${this.apiUrl}/${id}`, ubicacion);
  }

}