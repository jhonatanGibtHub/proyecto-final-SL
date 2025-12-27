import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UbigeoService {

  private apiUrl = 'https://free.e-api.net.pe/ubigeos.json';

  constructor(private http: HttpClient) {}

  getUbigeos(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
