import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  isEditProfileOpen = false;

  // Datos del perfil
  profileData = {
    name: '',
    title: '',
    location: ''
  };

  // Abrir formulario de edición
  openEditProfile() {
    this.isEditProfileOpen = true;
  }

  // Cerrar formulario
  closeEditProfile() {
    this.isEditProfileOpen = false;
  }

  // Guardar cambios
  saveProfile() {
    console.log('Datos guardados:', this.profileData);
    // Aquí puedes agregar la lógica para enviar datos al backend
    this.closeEditProfile();
  }
}