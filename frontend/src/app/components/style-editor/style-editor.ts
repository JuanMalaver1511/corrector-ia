import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { Loading } from '../loading/loading';

import * as mammoth from "mammoth";        // Word extractor
import * as pdfjsLib from "pdfjs-dist";    // PDF extractor

@Component({
  selector: 'app-style-editor',
  imports: [Navbar, CommonModule, Loading],
  templateUrl: './style-editor.html',
  styleUrl: './style-editor.css',
})
export class StyleEditor {

  constructor(private router: Router) {}

  isDragging = false;
  selectedFile: File | null = null;
  isLoading = false;

  // ---------------------------
  // EVENTOS DEL DRAG & DROP
  // ---------------------------

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
      this.processFile(this.selectedFile);
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;

    if (!this.selectedFile) {
      alert('No se ha seleccionado ningún archivo');
      return;
    }

    this.processFile(this.selectedFile);
  }

  // ---------------------------
  // PROCESAR ARCHIVO
  // ---------------------------

  processFile(file: File) {
    this.isLoading = true;

    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type.includes("pdf")) {
      this.extractPdfText(file);

    } else if (name.endsWith(".docx") || type.includes("word")) {
      this.extractWordText(file);

    } else {
      this.extractTextFile(file);
    }
  }

  // ---------------------------
  // EXTRAER TEXTO DE TXT
  // ---------------------------

  extractTextFile(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      localStorage.setItem('uploadedDocument', reader.result as string);
      this.redirect();
    };

    reader.readAsText(file);
  }

  // ---------------------------
  // EXTRAER TEXTO DE WORD .DOCX
  // ---------------------------

  extractWordText(file: File) {
    const reader = new FileReader();

    reader.onload = async () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      localStorage.setItem('uploadedDocument', text);
      this.redirect();
    };

    reader.readAsArrayBuffer(file);
  }

  // ---------------------------
  // EXTRAER TEXTO DE PDF
  // ---------------------------

  async extractPdfText(file: File) {
    const reader = new FileReader();

    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer);

      const pdf: any = await pdfjsLib.getDocument(typedArray).promise;
      let finalText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const strings = textContent.items.map((item: any) => item.str);
        finalText += strings.join(" ") + "\n\n";
      }

      localStorage.setItem('uploadedDocument', finalText);
      this.redirect();
    };

    reader.readAsArrayBuffer(file);
  }

  // ---------------------------
  // REDIRECCIÓN
  // ---------------------------

  redirect() {
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/style-customization']);
    }, 1000);
  }
}
