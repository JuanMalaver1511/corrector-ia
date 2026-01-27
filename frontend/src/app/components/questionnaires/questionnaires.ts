import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from "../navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Loading } from '../loading/loading';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-questionnaires',
  standalone: true,
  imports: [
    CommonModule,  
    FormsModule,    
    Navbar,
    Loading
  ],
  templateUrl: './questionnaires.html',
  styleUrl: './questionnaires.css',
})
export class Questionnaires {

  private apiUrl = environment.apiUrl;

  prompt: string = '';
  result: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  analizeQuestionnaire(): void {
    console.log('🚀 Iniciando análisis');
    console.log('Prompt enviado:', this.prompt);

    if (this.isLoading) {
      console.log('⚠️ Ya está cargando, cancelando...');
      return;
    }

    this.ngZone.run(() => {
      this.isLoading = true;
      this.result = '';
      console.log('✅ isLoading establecido a TRUE');
      console.log('✅ result limpiado');
    });

    const payload = {
      tema: this.prompt,
      tipo: 'opción múltiple',
      cantidad: 10
    };

    console.log('📤 Enviando petición al backend...');

    this.http.post<any>(`${this.apiUrl}/ia/questionnaire`, payload)
      .subscribe({
        next: (res) => {
          console.log('📥 Respuesta recibida del backend:', res);
          
          // Ejecuta el cambio de estado dentro de ngZone
          this.ngZone.run(() => {
            this.result = res.cuestionario || '';
            this.isLoading = false;
            
            console.log('✅ result actualizado:', this.result.substring(0, 50) + '...');
            console.log('✅ isLoading establecido a FALSE');
            console.log('✅ Longitud del resultado:', this.result.length);
            
            // Fuerza detección de cambios
            this.cdr.markForCheck();
            this.cdr.detectChanges();
            
            console.log('✅ Detección de cambios forzada');
          });
        },
        error: (err) => {
          console.error('Error del backend:', err);
          
          this.ngZone.run(() => {
            this.isLoading = false;
            this.result = 'Error al generar el cuestionario. Por favor intenta de nuevo.';
            this.cdr.detectChanges();
          });
        },
        complete: () => {
          console.log('Observable completado');
        }
      });
  }

  download(): void {
    console.log('💾 Iniciando descarga...');
    
    if (!this.result) {
      console.log('⚠️ No hay resultado para descargar');
      return;
    }

    const blob = new Blob([this.result], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'cuestionario.txt';
    a.click();

    window.URL.revokeObjectURL(url);
    console.log('✅ Descarga completada');
  }
}
