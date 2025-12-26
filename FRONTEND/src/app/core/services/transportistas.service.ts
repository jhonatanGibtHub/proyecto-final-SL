import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Transportista, TransportistaResponse } from '../models/transportista';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransportistasService {

  private apiUrl = `${environment.apiUrl}/transportistas`
  constructor(private http: HttpClient) { }

  obtenerTransportistas(): Observable<TransportistaResponse> {
    return this.http.get<TransportistaResponse>(this.apiUrl);
  }

  obtenerTransportistaPorId(id: number): Observable<TransportistaResponse> {
    return this.http.get<TransportistaResponse>(`${this.apiUrl}/${id}`);
  }

  eliminarTransportista(id: number): Observable<TransportistaResponse> {
    return this.http.delete<TransportistaResponse>(`${this.apiUrl}/${id}`);
  }

  crearTransportista(transportista: Transportista): Observable<TransportistaResponse> {
    return this.http.post<TransportistaResponse>(this.apiUrl, transportista);
  }

  actualizarTransportista(id: number, transportista: Transportista): Observable<TransportistaResponse> {
    return this.http.put<TransportistaResponse>(`${this.apiUrl}/${id}`, transportista);
  }

}