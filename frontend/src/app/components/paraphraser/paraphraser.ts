import { Component } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { CommonModule } from '@angular/common';
import { Loading } from '../loading/loading';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';

import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

@Component({
  selector: 'app-paraphraser',
  imports: [Navbar, Loading, CommonModule, FormsModule],
  templateUrl: './paraphraser.html',
  styleUrl: './paraphraser.css',
})
export class Paraphraser {

  constructor(private http: HttpClient, private zone: NgZone, private cdRef: ChangeDetectorRef) { }

  paraphrasedText: string = '';
  originalText: string = '';
  isDragging = false;
  selectedFile: File | null = null;
  isLoading = false;
  isParaphraseOk = false;

  // ---------------------------
  // PARAFRASEAR IA
  // ---------------------------
parafrasear() {

  console.log('🧠 Click en parafrasear');

  if (!this.paraphrasedText.trim()) {
    console.warn('⚠️ Texto vacío, no se envía a la IA');
    return;
  }

  this.isLoading = true;
  this.isParaphraseOk = false;
  console.log('📡 Enviando texto a IA...');

  this.http.post<any>('http://localhost:8000/ia/paraphrase', {
    texto: this.paraphrasedText
  })
  .pipe(
    finalize(() => {
      this.zone.run(() => {
        this.isLoading = false;
        this.cdRef.detectChanges(); // 👈 aquí sí
      });
    })
  )
  .subscribe({
    next: (res) => {
      console.log('✅ Respuesta IA:', res);
      this.zone.run(() => {
        this.paraphrasedText = res.resultado;
        this.isParaphraseOk = true;
        this.cdRef.detectChanges();
      });
    },
    error: (err) => {
      console.error('❌ Error IA:', err);
    }
  });
}

  // ---------------------------
  // DRAG & DROP
  // ---------------------------
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
    console.log('📥 Drag over');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    console.log('📤 Drag leave');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    console.log('📂 Archivo soltado');

    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
      console.log('📄 Archivo:', this.selectedFile.name);
      this.processFile(this.selectedFile);
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;

    if (!this.selectedFile) {
      console.warn('⚠️ No se seleccionó archivo');
      return;
    }

    console.log('📄 Archivo seleccionado:', this.selectedFile.name);
    this.processFile(this.selectedFile);
  }

  // ---------------------------
  // PROCESAR ARCHIVO
  // ---------------------------
  async processFile(file: File) {
    this.isLoading = true;
    console.log('⚙️ Procesando archivo...');
    console.log('📌 Tipo:', file.type);
    console.log('📌 Nombre:', file.name);

    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    try {
      if (type.includes("pdf")) {
        console.log('📕 Detectado PDF');
        await this.extractPdfText(file);
      } else if (name.endsWith(".docx") || type.includes("word")) {
        console.log('📘 Detectado DOCX');
        await this.extractWordText(file);
      } else {
        console.log('📄 Detectado TXT');
        await this.extractTextFile(file);
      }
    } catch (error) {
      console.error('❌ Error procesando archivo:', error);
    } finally {
  this.zone.run(() => {
    this.isLoading = false;
    this.cdRef.detectChanges();
    console.log('✅ Proceso completado, loading desactivado');
  });
}

  }

  // ---------------------------
  // TXT
  // ---------------------------
  extractTextFile(file: File): Promise<void> {
    console.log('📄 Leyendo TXT...');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        console.log('✅ TXT leído');
        this.zone.run(() => {
          this.originalText = reader.result as string;
          this.paraphrasedText = this.originalText;
          resolve();
        });
      };

      reader.onerror = (e) => {
        console.error('❌ Error leyendo TXT', e);
        reject(e);
      };

      reader.readAsText(file);
    });
  }

  // ---------------------------
  // DOCX
  // ---------------------------
  extractWordText(file: File): Promise<void> {
    console.log('📘 Leyendo DOCX...');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          this.zone.run(() => {
            console.log('✅ DOCX leído');
            this.originalText = result.value;
            this.paraphrasedText = result.value;
            resolve();
          });
        } catch (e) {
          console.error('❌ Error DOCX', e);
          reject(e);
        }
      };

      reader.onerror = (e) => {
        console.error('❌ Error FileReader DOCX', e);
        reject(e);
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // ---------------------------
  // PDF
  // ---------------------------
  extractPdfText(file: File): Promise<void> {
    console.log('📕 Leyendo PDF...');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          console.log('📕 FileReader PDF OK');

          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          console.log('📕 Uint8Array creado');

          const pdf: any = await pdfjsLib.getDocument(typedArray).promise;
          console.log('📕 PDF cargado, páginas:', pdf.numPages);

          let finalText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`📄 Leyendo página ${i}`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const strings = textContent.items.map((item: any) => item.str);
            finalText += strings.join(' ') + '\n\n';
          }

          console.log('✅ PDF leído completo');
          this.originalText = finalText;
          this.paraphrasedText = finalText;
          resolve();
        } catch (e) {
          console.error('❌ Error PDF', e);
          reject(e);
        }
      };

      reader.onerror = (e) => {
        console.error('❌ Error FileReader PDF', e);
        reject(e);
      };

      reader.readAsArrayBuffer(file);
    });
  }
  copiarTexto(): void {
  if (!this.paraphrasedText) {
    return;
  }

  navigator.clipboard.writeText(this.paraphrasedText)
    .then(() => {
      console.log('Texto copiado al portapapeles');
    })
    .catch(err => {
      console.error('Error al copiar', err);
    });
}

}