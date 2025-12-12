import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  errorMessage: string = '';

  constructor(private router: Router) {}
  login(usuario: string, password: string) {
    const userTest = 'juanma';
    const passTest = '1234';

    if (usuario === userTest && password === passTest) {
      this.errorMessage = '';
      console.log('Inicio de sesión correcto');
      
      // this.router.navigate(['/dashboard']);
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Usuario o contraseña incorrectos';
    }
  }
}
