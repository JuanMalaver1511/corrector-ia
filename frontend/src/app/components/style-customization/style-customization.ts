import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorrectorService } from '../../services/corrector';
import { finalize } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

interface ErrorCorreccion {
  original: string;
  correccion: string;
  motivo: string;
  posicion?: number;
}

interface ResultadoFragmento {
  fragmento_num: number;
  errores: ErrorCorreccion[];
  texto_corregido: string;
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
  resultadoCorreccion: any = null;
  loading = false;
  errorPercent = 0;
  
  // Control de progreso
  progreso = 0;
  fragmentoActual = 0;
  totalFragmentos = 0;
  
  // Almacenar todos los errores y texto corregido
  todosLosErrores: ErrorCorreccion[] = [];
  textoCorregidoCompleto: string = '';

  constructor(
    private correctorService: CorrectorService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const content = localStorage.getItem('uploadedDocument');
    this.documentContent = content || 'No se encontró ningún documento cargado.';
    this.documentContentHTML = this.documentContent;
  }

  /**
   * Divide el texto en fragmentos de tamaño máximo
   */
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

  /**
   * Procesa el documento completo por fragmentos
   */
  corregirDocumento(): void {
    if (!this.documentContent || this.loading) return;

    this.loading = true;
    this.progreso = 0;
    this.fragmentoActual = 0;
    this.errorPercent = 0;
    this.resultadoCorreccion = null;
    this.todosLosErrores = [];
    this.textoCorregidoCompleto = '';

    // Dividir documento en fragmentos
    const fragmentos = this.dividirTextoEnFragmentos(this.documentContent, 3000);
    this.totalFragmentos = fragmentos.length;

    console.log(`📄 Documento dividido en ${this.totalFragmentos} fragmentos`);

    // Procesar fragmentos secuencialmente
    this.procesarFragmentosSecuencialmente(fragmentos, 0);
  }

  /**
   * Procesa los fragmentos uno por uno de forma secuencial
   */
  private procesarFragmentosSecuencialmente(fragmentos: string[], indice: number): void {
    if (indice >= fragmentos.length) {
      // Todos los fragmentos procesados
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
            // Acumular errores
            if (resultado.errores && Array.isArray(resultado.errores)) {
              this.todosLosErrores.push(...resultado.errores);
            }
            
            // Acumular texto corregido
            if (resultado.corregido || resultado.texto_corregido) {
              this.textoCorregidoCompleto += (this.textoCorregidoCompleto ? ' ' : '') + 
                                            (resultado.corregido || resultado.texto_corregido);
            }
          }

          // Procesar siguiente fragmento
          this.procesarFragmentosSecuencialmente(fragmentos, indice + 1);
        },
        error: (err) => {
          console.error(`❌ Error en fragmento ${indice + 1}:`, err);
          
          // Continuar con el siguiente fragmento aunque haya error
          this.procesarFragmentosSecuencialmente(fragmentos, indice + 1);
        }
      });
  }

  /**
   * Finaliza el proceso de corrección
   */
private finalizarCorreccion(): void {
  this.loading = false;
  this.progreso = 100;

  console.log('🎯 FINALIZANDO CORRECCIÓN');
  console.log('📊 todosLosErrores:', this.todosLosErrores);
  console.log('📊 Cantidad de errores:', this.todosLosErrores.length);
  console.log('📝 Texto corregido:', this.textoCorregidoCompleto.substring(0, 100));

  // Crear resultado consolidado
  this.resultadoCorreccion = {
    errores: this.todosLosErrores,
    corregido: this.textoCorregidoCompleto || this.documentContent,
    total_errores: this.todosLosErrores.length
  };

  console.log('✅ Corrección completada. Total errores: ${this.todosLosErrores.length}');

  this.marcarErrores();
  
  console.log('🔢 LLAMANDO A calcularPorcentaje()');
  this.calcularPorcentaje();
  console.log('📊 errorPercent después de calcular:', this.errorPercent);
  
  this.cdr.detectChanges();
}

  /**
   * Parsea la respuesta del servicio
   */
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

  /**
   * Marca errores en el texto con HTML
   */
  marcarErrores(): void {
    if (!this.documentContent) {
      console.warn('documentContent vacío');
      return;
    }

    let texto = this.documentContent;

    if (!this.todosLosErrores?.length) {
      this.documentContentHTML = this.sanitizer.bypassSecurityTrustHtml(texto);
      return;
    }

    // Ordenar errores por longitud (más largos primero) para evitar reemplazos parciales
    const erroresOrdenados = [...this.todosLosErrores].sort((a, b) => 
      (b.original?.length || 0) - (a.original?.length || 0)
    );

    erroresOrdenados.forEach((err: ErrorCorreccion) => {
      if (!err.original) return;

      const palabra = err.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${palabra})\\b`, 'gi');

      texto = texto.replace(
        regex,
        `<span class="error" title="Corrección: ${err.correccion || ''} - ${err.motivo || ''}">$1</span>`
      );
    });

    this.documentContentHTML = this.sanitizer.bypassSecurityTrustHtml(texto);
  }

  /**
   * Calcula el porcentaje de errores
   */
calcularPorcentaje(): void {
  const texto = this.documentContent?.trim() || '';

  if (!texto) {
    console.log('❌ No hay texto');
    this.errorPercent = 0;
    return;
  }

  const palabras = texto.split(/\s+/).length;
  console.log('📝 Total palabras:', palabras);

  if (!this.todosLosErrores?.length) {
    console.log('❌ No hay errores detectados');
    this.errorPercent = 0;
    return;
  }

  console.log('🔴 Total errores:', this.todosLosErrores.length);

  this.errorPercent = Math.min(
    100,
    Math.round((this.todosLosErrores.length / palabras) * 100)
  );
  
  console.log('📊 Porcentaje calculado:', this.errorPercent);
}

  /**
   * Descarga el documento corregido en formato DOCX
   */
descargarDocumentoCorregido(): void {
  const textoFinal =
    this.textoCorregidoCompleto || this.resultadoCorreccion?.corregido;

  if (!textoFinal) {
    alert('No hay documento corregido');
    return;
  }

  this.correctorService.descargarDocx(textoFinal)
    .subscribe(blob => {
      saveAs(blob, `documento-corregido-${Date.now()}.docx`);
    });
}


  /**
   * Descarga el reporte de errores en formato JSON
   */
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
