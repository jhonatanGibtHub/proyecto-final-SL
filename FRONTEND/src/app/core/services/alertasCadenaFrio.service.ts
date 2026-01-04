import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { AlertaCadenaFrio, AlertaCadenaFrioResponse } from '../models/alertaCadenaFrio';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertasCadenaFrioService {

  private apiUrl = `${environment.apiUrl}/alertas`

  constructor(private http: HttpClient) { }

  obtenerAlertas(): Observable<AlertaCadenaFrioResponse> {
    return this.http.get<AlertaCadenaFrioResponse>(this.apiUrl);
  }

  crearAlerta(alerta: AlertaCadenaFrio): Observable<AlertaCadenaFrioResponse> {
    return this.http.post<AlertaCadenaFrioResponse>(this.apiUrl, alerta);
  }



  enviarAlerta(
    medicion: number,
    lote: number,
    tipo: string,
    estado_actual: string
  ): Observable<AlertaCadenaFrioResponse> {
    return this.http.post<AlertaCadenaFrioResponse>(`${this.apiUrl}/enviaralerta/`,
      {
        id_medicion: medicion,
        id_lote: lote,
        tipo_alerta: tipo,
        estado: estado_actual,
      }
    );
  }

  obtenerAlertaPorId(id: number): Observable<AlertaCadenaFrioResponse> {
    return this.http.get<AlertaCadenaFrioResponse>(`${this.apiUrl}/${id}`);
  }



  cambiarEstadoAlerta(id: number, estado: string): Observable<AlertaCadenaFrioResponse> {
    return this.http.put<AlertaCadenaFrioResponse>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  eliminarAlerta(id: number): Observable<AlertaCadenaFrioResponse> {
    return this.http.delete<AlertaCadenaFrioResponse>(`${this.apiUrl}/${id}`);
  }

}