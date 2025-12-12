import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  
  menuOpen = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    // Eliminar datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    // Opcional: borrar todo
    localStorage.clear();

    console.log('Sesión cerrada');

    // Redirigir al login
    this.router.navigate(['/login']);
  }
}
