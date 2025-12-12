import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CorrectorService {

  private apiUrl = 'http://localhost:8000/ia/corregir'; // Ajusta tu URL

  constructor(private http: HttpClient) {}

  // ejemplo: enviar el contenido a la API
  analizarDocumento(texto: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ia/corregir`, { texto });
  }
}
