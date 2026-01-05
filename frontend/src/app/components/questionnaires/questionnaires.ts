import { Component } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-questionnaires',
  imports: [Navbar],
  templateUrl: './questionnaires.html',
  styleUrl: './questionnaires.css',
})
export class Questionnaires {

  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {

  }
  generateQuestionnaire() : void {

  }

}
