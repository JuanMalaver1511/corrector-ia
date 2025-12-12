import { Component, OnInit } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  ngOnInit(): void {
    const content = localStorage.getItem('uploadedDocument');

    if (content) {
      this.documentContent = content;
    } else {
      this.documentContent = 'No se encontró ningún documento cargado.';
    }
  }
}
