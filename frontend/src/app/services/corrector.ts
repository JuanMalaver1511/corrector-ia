import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CorrectorService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ejemplo: enviar el contenido a la API
  analizarDocumento(texto: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ia/corregir`, { texto });
  }
  descargarDocx(texto: string) {
  return this.http.post(
    `${this.apiUrl}/export/docx`,
    { texto },
    { responseType: 'blob' }
  );
}
}
