import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { SensorTemp, SensorTempResponse } from '../models/sensorTemp';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensoresTempService {

  private apiUrl = `${environment.apiUrl}/sensores`
  constructor(private http: HttpClient) { }

  obtenerSensores(): Observable<SensorTempResponse> {
    return this.http.get<SensorTempResponse>(this.apiUrl);
  }

  obtenerSensorPorId(id: number): Observable<SensorTempResponse> {
    return this.http.get<SensorTempResponse>(`${this.apiUrl}/${id}`);
  }

  crearSensor(sensor: SensorTemp): Observable<SensorTempResponse> {
    return this.http.post<SensorTempResponse>(this.apiUrl, sensor);
  }

  actualizarSensor(id: number, sensor: SensorTemp): Observable<SensorTempResponse> {
    return this.http.put<SensorTempResponse>(`${this.apiUrl}/${id}`, sensor);
  }

}