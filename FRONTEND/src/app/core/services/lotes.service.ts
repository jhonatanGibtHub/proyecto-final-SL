import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Lote, LoteResponse } from '../models/lote';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LotesService {

  private apiUrl = `${environment.apiUrl}/lotes`
  constructor(private http: HttpClient) { }

  obtenerLotes(): Observable<LoteResponse> {
    return this.http.get<LoteResponse>(this.apiUrl);
  }

  obtenerLotePorId(id: number): Observable<LoteResponse> {
    return this.http.get<LoteResponse>(`${this.apiUrl}/${id}`);
  }

  crearLote(lote: Lote): Observable<LoteResponse> {
    return this.http.post<LoteResponse>(this.apiUrl, lote);
  }

  actualizarLote(id: number, lote: Lote): Observable<LoteResponse> {
    return this.http.put<LoteResponse>(`${this.apiUrl}/${id}`, lote);
  }

}