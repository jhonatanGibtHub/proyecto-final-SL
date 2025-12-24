import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Vacuna, VacunaResponse } from '../models/vacuna';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VacunasService {

  private apiUrl = `${environment.apiUrl}/vacunas`
  constructor(private http: HttpClient) { }

  obtenerVacunas():Observable<VacunaResponse>{    
    return this.http.get<VacunaResponse>(this.apiUrl);
  }
 
  obtenerVacunaPorId(id: number): Observable<VacunaResponse> {
    return this.http.get<VacunaResponse>(`${this.apiUrl}/${id}`);
  }
  eliminarVacuna(id:number):Observable<VacunaResponse> {
    return this.http.delete<VacunaResponse>(`${this.apiUrl}/${id}`);
  }
  crearVacuna(vacuna:Vacuna):Observable<VacunaResponse>{
    return this.http.post<VacunaResponse>(this.apiUrl, vacuna); 
  }
  actualizarVacuna(id:number, vacuna:Vacuna):Observable<VacunaResponse> {
    return this.http.put<VacunaResponse>(`${this.apiUrl}/${id}`,vacuna);
  }

}
