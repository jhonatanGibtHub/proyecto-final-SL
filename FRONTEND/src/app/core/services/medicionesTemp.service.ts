import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { MedicionTemp, MedicionTempResponse } from '../models/medicionTemp';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicionesTempService {

  private apiUrl = `${environment.apiUrl}/mediciones`
  constructor(private http: HttpClient) { }

  obtenerMediciones(): Observable<MedicionTempResponse> {
    return this.http.get<MedicionTempResponse>(this.apiUrl);
  }

  obtenerMedicionPorId(id: number): Observable<MedicionTempResponse> {
    return this.http.get<MedicionTempResponse>(`${this.apiUrl}/${id}`);
  }

  crearMedicion(medicion: MedicionTemp): Observable<MedicionTempResponse> {
    return this.http.post<MedicionTempResponse>(this.apiUrl, medicion);
  }

  actualizarMedicion(id: number, medicion: MedicionTemp): Observable<MedicionTempResponse> {
    return this.http.put<MedicionTempResponse>(`${this.apiUrl}/${id}`, medicion);
  }

  eliminarMedicion(id: number): Observable<MedicionTempResponse> {
    return this.http.delete<MedicionTempResponse>(`${this.apiUrl}/${id}`);
  }

  actualizarTemperatura(
    id: number,
    temperatura: number
  ): Observable<MedicionTempResponse> {

    return this.http.put<MedicionTempResponse>(
      `${this.apiUrl}/actualizartemp/${id}`,
      { temperatura_c: temperatura }
    );
  }

}