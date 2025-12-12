import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CorrectorService {

  private API_URL = 'http://127.0.0.1:8000';  // tu backend FastAPI

  constructor(private http: HttpClient) {}

  corregirTexto(texto: string): Observable<any> {
    return this.http.post(`${this.API_URL}/corregir`, {
      texto: texto
    });
  }
}
