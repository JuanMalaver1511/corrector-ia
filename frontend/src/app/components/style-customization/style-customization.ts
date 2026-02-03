import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorrectorService } from '../../services/corrector';
import { finalize } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface ErrorCorreccion {
  original: string;
  correccion: string;
  motivo: string;
  posicion?: number;
}

interface ElementoDocumento {
  tipo: string;
  texto: string;
  negrita: boolean;
  italica: boolean;
  estilo: string;
}

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
  documentStructure: ElementoDocumento[] = [];
  resultadoCorreccion: any = null;
  loading = false;
  errorPercent = 0;
  
  progreso = 0;
  fragmentoActual = 0;
  totalFragmentos = 0;
  
  todosLosErrores: ErrorCorreccion[] = [];
  textoCorregidoCompleto: string = '';

  constructor(
    private correctorService: CorrectorService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Recuperar texto plano
    const content = localStorage.getItem('uploadedDocument');
    this.documentContent = content || 'No se encontró ningún documento cargado.';
    
    // Recuperar HTML con estilos
    const htmlContent = localStorage.getItem('uploadedDocumentHTML');
    
    // Recuperar estructura del documento
    const estructuraStr = localStorage.getItem('uploadedDocumentStructure');
    if (estructuraStr) {
      try {
        this.documentStructure = JSON.parse(estructuraStr);
      } catch (e) {
        console.warn('No se pudo parsear la estructura del documento');
      }
    }
    
    // Mostrar HTML con estilos
    if (htmlContent) {
      this.documentContentHTML = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
    } else {
      // Generar HTML básico del texto
      const htmlBasico = this.documentContent
        .split('\n')
        .map(linea => linea.trim() ? `<p>${linea}</p>` : '')
        .join('');
      this.documentContentHTML = this.sanitizer.bypassSecurityTrustHtml(htmlBasico);
    }
  }

  dividirTextoEnFragmentos(texto: string, tamanioMaximo: number = 3000): string[] {
    const palabras = texto.split(/\s+/);
    const fragmentos: string[] = [];
    let fragmentoActual: string[] = [];
    let longitudActual = 0;

    for (const palabra of palabras) {
      const nuevaLongitud = longitudActual + palabra.length + 1;
      
      if (nuevaLongitud > tamanioMaximo && fragmentoActual.length > 0) {
        fragmentos.push(fragmentoActual.join(' '));
        fragmentoActual = [palabra];
        longitudActual = palabra.length;
      } else {
        fragmentoActual.push(palabra);
        longitudActual = nuevaLongitud;
      }
    }

    if (fragmentoActual.length > 0) {
      fragmentos.push(fragmentoActual.join(' '));
    }

    return fragmentos;
  }

  corregirDocumento(): void {
    if (!this.documentContent || this.loading) return;

    this.loading = true;
    this.progreso = 0;
    this.fragmentoActual = 0;
    this.errorPercent = 0;
    this.resultadoCorreccion = null;
    this.todosLosErrores = [];
    this.textoCorregidoCompleto = '';

    const fragmentos = this.dividirTextoEnFragmentos(this.documentContent, 3000);
    this.totalFragmentos = fragmentos.length;

    console.log(`📄 Documento dividido en ${this.totalFragmentos} fragmentos`);

    this.procesarFragmentosSecuencialmente(fragmentos, 0);
  }

  private procesarFragmentosSecuencialmente(fragmentos: string[], indice: number): void {
    if (indice >= fragmentos.length) {
      this.finalizarCorreccion();
      return;
    }

    this.fragmentoActual = indice + 1;
    this.progreso = Math.round((this.fragmentoActual / this.totalFragmentos) * 100);

    console.log(`🔄 Procesando fragmento ${this.fragmentoActual}/${this.totalFragmentos}`);

    this.correctorService.analizarDocumento(fragmentos[indice])
      .pipe(
        finalize(() => {
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          const resultado = this.parsearRespuesta(res);
          
          if (resultado) {
            if (resultado.errores && Array.isArray(resultado.errores)) {
              this.todosLosErrores.push(...resultado.errores);
            }
            
            if (resultado.corregido || resultado.texto_corregido) {
              this.textoCorregidoCompleto += (this.textoCorregidoCompleto ? ' ' : '') + 
                                            (resultado.corregido || resultado.texto_corregido);
            }
          }

          this.procesarFragmentosSecuencialmente(fragmentos, indice + 1);
        },
        error: (err) => {
          console.error(`❌ Error en fragmento ${indice + 1}:`, err);
          this.procesarFragmentosSecuencialmente(fragmentos, indice + 1);
        }
      });
  }

  private finalizarCorreccion(): void {
    this.loading = false;
    this.progreso = 100;

    console.log('🎯 FINALIZANDO CORRECCIÓN');

    this.resultadoCorreccion = {
      errores: this.todosLosErrores,
      corregido: this.textoCorregidoCompleto || this.documentContent,
      total_errores: this.todosLosErrores.length
    };

    console.log(`✅ Corrección completada. Total errores: ${this.todosLosErrores.length}`);

    this.marcarErrores();
    this.calcularPorcentaje();
    
    this.cdr.detectChanges();
  }

  private parsearRespuesta(res: any): any {
    if (typeof res === 'string') {
      try {
        return JSON.parse(res);
      } catch {
        console.warn('La respuesta no es JSON válido');
        return null;
      }
    }
    return res;
  }

  marcarErrores(): void {
    const htmlOriginal = localStorage.getItem('uploadedDocumentHTML') || '';
    let html = htmlOriginal;

    if (!html) {
      html = this.documentContent
        .split('\n')
        .map(linea => linea.trim() ? `<p>${linea}</p>` : '')
        .join('');
    }

    if (!this.todosLosErrores?.length) {
      this.documentContentHTML = this.sanitizer.bypassSecurityTrustHtml(html);
      return;
    }

    const erroresOrdenados = [...this.todosLosErrores].sort((a, b) => 
      (b.original?.length || 0) - (a.original?.length || 0)
    );

    erroresOrdenados.forEach((err: ErrorCorreccion) => {
      if (!err.original) return;

      const palabra = err.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(>[^<]*)(\\b${palabra}\\b)([^<]*)`, 'gi');

      html = html.replace(
        regex,
        `$1<span class="error" title="Corrección: ${err.correccion || ''} - ${err.motivo || ''}">$2</span>$3`
      );
    });

    this.documentContentHTML = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  calcularPorcentaje(): void {
    const texto = this.documentContent?.trim() || '';

    if (!texto) {
      this.errorPercent = 0;
      return;
    }

    const palabras = texto.split(/\s+/).length;

    if (!this.todosLosErrores?.length) {
      this.errorPercent = 0;
      return;
    }

    this.errorPercent = Math.min(
      100,
      Math.round((this.todosLosErrores.length / palabras) * 100)
    );
  }

  /**
   * Descarga el documento corregido preservando estilos de la estructura original
   */
  descargarDocumentoCorregido(): void {
    const textoFinal = this.textoCorregidoCompleto || this.resultadoCorreccion?.corregido;

    if (!textoFinal) {
      alert('No hay documento corregido');
      return;
    }

    try {
      // Crear documento Word con la estructura original
      const doc = this.crearDocumentoConEstilos(textoFinal);
      
      Packer.toBlob(doc).then(blob => {
        const fecha = new Date().toISOString().split('T')[0];
        saveAs(blob, `documento-corregido-${fecha}.docx`);
      });
    } catch (error) {
      console.error('Error al crear documento:', error);
      alert('Error al generar el documento Word');
    }
  }

  /**
   * Crea un documento Word preservando la estructura original
   */
  private crearDocumentoConEstilos(textoCorregido: string): Document {
    const paragraphs: Paragraph[] = [];
    
    if (this.documentStructure && this.documentStructure.length > 0) {
      // Usar la estructura original
      const lineasCorregidas = textoCorregido.split('\n');
      let indiceLinea = 0;
      
      this.documentStructure.forEach(elemento => {
        const textoElemento = lineasCorregidas[indiceLinea] || elemento.texto;
        indiceLinea++;
        
        if (!textoElemento.trim()) return;
        
        const opciones: any = {
          children: [
            new TextRun({
              text: textoElemento,
              bold: elemento.negrita,
              italics: elemento.italica,
              size: this.getTamanoSegunTipo(elemento.tipo)
            })
          ],
          spacing: { after: 200 }
        };
        
        // Aplicar nivel de título
        switch (elemento.tipo) {
          case 'h1':
            opciones.heading = HeadingLevel.HEADING_1;
            break;
          case 'h2':
            opciones.heading = HeadingLevel.HEADING_2;
            break;
          case 'h3':
            opciones.heading = HeadingLevel.HEADING_3;
            break;
        }
        
        paragraphs.push(new Paragraph(opciones));
      });
    } else {
      // Sin estructura, crear párrafos simples
      const lineas = textoCorregido.split('\n');
      lineas.forEach(linea => {
        if (linea.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: linea,
                  size: 22 // 11pt
                })
              ],
              spacing: { after: 200 }
            })
          );
        }
      });
    }

    return new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 pulgada
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: paragraphs
      }]
    });
  }

  /**
   * Obtiene el tamaño de fuente según el tipo de elemento
   */
  private getTamanoSegunTipo(tipo: string): number {
    switch (tipo) {
      case 'h1': return 32; // 16pt
      case 'h2': return 28; // 14pt
      case 'h3': return 24; // 12pt
      default: return 22;   // 11pt
    }
  }

  descargarReporteErrores(): void {
    if (!this.todosLosErrores?.length) {
      alert('No hay errores para descargar');
      return;
    }

    const reporte = {
      fecha: new Date().toISOString(),
      total_errores: this.todosLosErrores.length,
      porcentaje_error: this.errorPercent,
      errores: this.todosLosErrores
    };

    const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
    saveAs(blob, `reporte-errores-${new Date().getTime()}.json`);
  }
}