import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from "../navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-questionnaires',
  standalone: true,
  imports: [
    CommonModule,   // 👈 NECESARIO para *ngIf, *ngFor, etc
    FormsModule,    // 👈 NECESARIO para ngModel
    Navbar
  ],
  templateUrl: './questionnaires.html',
  styleUrl: './questionnaires.css',
})
export class Questionnaires {

  private apiUrl = 'http://localhost:8000';

  prompt: string = '';
  result: string = '';

  constructor(private http: HttpClient) {}

  analizeQuestionnaire(): void {
    const payload = {
      tema: this.prompt,
      tipo: 'opción múltiple',
      cantidad: 10
    };

    this.http.post<any>(`${this.apiUrl}/ia/questionnaire`, payload)
      .subscribe({
        next: (res) => this.result = res.cuestionario,
        error: (err) => console.error(err)
      });
  }

  download(): void {
    const blob = new Blob([this.result], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'cuestionario.txt';
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
