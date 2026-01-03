import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { InventarioStock, InventarioStockResponse } from '../models/inventarioStock';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioStockService {

  private apiUrl = `${environment.apiUrl}/stock`
  constructor(private http: HttpClient) { }

  obtenerInventarioStock(): Observable<InventarioStockResponse> {
    return this.http.get<InventarioStockResponse>(this.apiUrl);
  }

  obtenerInventarioStockPorId(id: number): Observable<InventarioStockResponse> {
    return this.http.get<InventarioStockResponse>(`${this.apiUrl}/${id}`);
  }

  crearInventarioStock(inventarioStock: InventarioStock): Observable<InventarioStockResponse> {
    return this.http.post<InventarioStockResponse>(this.apiUrl, inventarioStock);
  }

  actualizarInventarioStock(id: number, inventarioStock: InventarioStock): Observable<InventarioStockResponse> {
    return this.http.put<InventarioStockResponse>(`${this.apiUrl}/${id}`, inventarioStock);
  }


  actualizarcantidad(
    id: number,
    cantidad: number
  ): Observable<InventarioStockResponse> {

    return this.http.put<InventarioStockResponse>(
      `${this.apiUrl}/actualizarcantidad/${id}`,
      { cantidad_a_sumar: cantidad }
    );
  }
}