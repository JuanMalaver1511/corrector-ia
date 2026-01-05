import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorrectorService } from '../../services/corrector';
import { finalize, timeout } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-style-customization',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './style-customization.html',
  styleUrls: ['./style-customization.css'],
})
export class StyleCustomization implements OnInit {


  documentContent: string = '';

  documentContentHTML: SafeHtml = '';


  resultadoCorreccion: any = null;

  loading = false;

  errorPercent = 0;

constructor(
  private correctorService: CorrectorService,
  private sanitizer: DomSanitizer,
  private cdr: ChangeDetectorRef
) {}


ngOnInit(): void {
  const content = localStorage.getItem('uploadedDocument');

  this.documentContent = content
    ? content
    : 'No se encontró ningún documento cargado.';

  this.documentContentHTML = this.documentContent;

  this.calcularPorcentaje();
}


  // 🚀 Ejecutar corrección con IA
  corregirDocumento(): void {
    if (!this.documentContent || this.loading) return;

    this.loading = true;
    this.errorPercent = 0;
    this.resultadoCorreccion = null;

    this.correctorService
      .analizarDocumento(this.documentContent)
      .pipe(
        timeout(60000), // ⏱ máximo 60s
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); 
        })
      )
      .subscribe({
        next: (res: any) => {

          if (typeof res === 'string') {
            try {
              res = JSON.parse(res);
            } catch {
              console.warn('La respuesta no es JSON válido');
              return;
            }
          }

          this.resultadoCorreccion = res;

           
          this.marcarErrores();
          this.cdr.detectChanges();
          this.calcularPorcentaje();

        },
        error: (err) => {
          console.error('Error en la corrección:', err);
        }
      });
  }

marcarErrores(): void {
  let texto = this.documentContent;

  if (!this.resultadoCorreccion?.errores?.length) {
    this.documentContentHTML =
      this.sanitizer.bypassSecurityTrustHtml(texto);
    return;
  }

  this.resultadoCorreccion.errores.forEach((err: any) => {
    if (!err.original) return;

    const palabra = err.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${palabra}\\b`, 'gi');

    texto = texto.replace(
      regex,
      `<span class="error"
        title="Corrección: ${err.correccion || ''} ${err.motivo || ''}">
        ${err.original}
      </span>`
    );
  });

  this.documentContentHTML =
    this.sanitizer.bypassSecurityTrustHtml(texto);
}


calcularPorcentaje(): void {
  const texto = this.documentContent?.trim() || '';

  if (!texto) {
    this.errorPercent = 0;
    return;
  }

  const palabras = texto.split(/\s+/).length;

  if (!this.resultadoCorreccion?.errores) {
    this.errorPercent = Math.min(100, Math.round(palabras * 0.5));
    return;
  }

  const errores = this.resultadoCorreccion.errores.length;

  this.errorPercent = Math.min(
    100,
    Math.round((errores / palabras) * 100)
  );
}



descargarDocumentoCorregido(): void {
  if (!this.resultadoCorreccion?.corregido) return;

  const doc = new Document({
    sections: [
      {
        children: this.resultadoCorreccion.corregido
          .split('\n')
          .map((line: string) => new Paragraph(line)),
      },
    ],
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, 'documento-corregido.docx');
  });
}

}
