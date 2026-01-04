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
  localStorage.clear();

  this.router.navigate(['/login'], { replaceUrl: true });
}
}
