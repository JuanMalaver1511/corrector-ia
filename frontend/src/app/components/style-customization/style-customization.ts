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

  // Texto original
  documentContent: string = '';

  // Texto con errores resaltados (HTML)
  documentContentHTML: string = '';

  // Respuesta completa de la IA
  resultadoCorreccion: any = null;

  loading: boolean = false;

  // Porcentaje de errores
  errorPercent: number = 0;

  constructor(private correctorService: CorrectorService) {}

  ngOnInit(): void {
    const content = localStorage.getItem('uploadedDocument');

    this.documentContent = content
      ? content
      : 'No se encontró ningún documento cargado.';

    this.documentContentHTML = this.documentContent;
  }

  // 🚀 Llamada a la IA
  corregirDocumento(): void {
    if (!this.documentContent) return;

    this.loading = true;
    this.resultadoCorreccion = null;

    this.correctorService.analizarDocumento(this.documentContent).subscribe({
      next: (res: any) => {
        this.resultadoCorreccion = res;

        this.marcarErrores();
        this.calcularPorcentaje();

        console.log('Resultado IA:', res);
      },
      error: (err) => {
        console.error('Error en API:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // 🔴 Marca los errores dentro del texto
  marcarErrores(): void {
    let texto = this.documentContent;

    if (!this.resultadoCorreccion?.errores) {
      this.documentContentHTML = texto;
      return;
    }

    this.resultadoCorreccion.errores.forEach((err: any) => {
      const palabra = err.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${palabra}\\b`, 'g');

      texto = texto.replace(
        regex,
        `<span class="error"
              title="Corrección: ${err.correccion} | ${err.motivo}">
          ${err.original}
         </span>`
      );
    });

    this.documentContentHTML = texto;
  }

  calcularPorcentaje(): void {
    if (!this.resultadoCorreccion?.errores?.length) {
      this.errorPercent = 0;
      return;
    }

    const totalPalabras = this.documentContent.trim().split(/\s+/).length;
    const totalErrores = this.resultadoCorreccion.errores.length;

    this.errorPercent = totalPalabras
      ? Math.min(100, Math.round((totalErrores / totalPalabras) * 100))
      : 0;
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

  descargarDocumentoCorregido(): void {
    if (!this.resultadoCorreccion?.corregido) return;

    const blob = new Blob(
      [this.resultadoCorreccion.corregido],
      { type: 'text/plain;charset=utf-8;' }
    );

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento-corregido.txt';
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
