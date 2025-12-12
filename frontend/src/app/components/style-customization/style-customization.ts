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
  searchQuery: string = '';
  resultadoCorreccion: any;

  constructor(private correctorService: CorrectorService) {}

  ngOnInit(): void {
    const content = localStorage.getItem('uploadedDocument');

    if (content) {
      this.documentContent = content;
    } else {
      this.documentContent = 'No se encontró ningún documento cargado.';
    }
  }

  corregirDocumento() {
    this.correctorService.analizarDocumento(this.documentContent).subscribe({
      next: (res) => {
        console.log("Resultado API:", res);
        this.resultadoCorreccion = res;
      },
      error: (err) => {
        console.error("Error en API:", err);
      }
    });
  }
}
