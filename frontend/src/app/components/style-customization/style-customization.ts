import { Component, OnInit } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorrectorService } from '../../services/corrector';

@Component({
  selector: 'app-style-customization',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './style-customization.html',
  styleUrls: ['./style-customization.css'],
})
export class StyleCustomization implements OnInit {

  documentContent: string = '';
  resultadoCorreccion: any;

  loading: boolean = false;
  errorPercent: number = 0;

  constructor(private correctorService: CorrectorService) {}

  ngOnInit(): void {
    const content = localStorage.getItem('uploadedDocument');

    this.documentContent = content
      ? content
      : 'No se encontró ningún documento cargado.';
  }

  corregirDocumento(): void {
    if (!this.documentContent) return;

    this.loading = true;
    this.resultadoCorreccion = null;

    this.correctorService.analizarDocumento(this.documentContent).subscribe({
      next: (res) => {
        console.log('Resultado API:', res);
        this.resultadoCorreccion = res;

        // 🔢 Cálculo del porcentaje de error (ajústalo según tu API)
        this.errorPercent = this.calcularPorcentajeError(res);
      },
      error: (err) => {
        console.error('Error en API:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  calcularPorcentajeError(respuesta: any): number {
    /**
     * EJEMPLOS según tu backend:
     *
     * - Si viene totalErrores y totalPalabras
     * - Si viene un array de errores
     */

    if (respuesta?.errores?.length) {
      return Math.min(100, respuesta.errores.length);
    }

    if (respuesta?.porcentajeError) {
      return respuesta.porcentajeError;
    }

    return 0;
  }

  descargarReporte(): void {
    if (!this.resultadoCorreccion) return;

    const data = JSON.stringify(this.resultadoCorreccion, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte-correccion.json';
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
