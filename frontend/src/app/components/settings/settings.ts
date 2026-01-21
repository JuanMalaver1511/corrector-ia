import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Navbar } from '../navbar/navbar';

interface Theme {
  label: string;
  value: string;
}

interface Language {
  label: string;
  value: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  // Temas disponibles
  themes: Theme[] = [
    { label: 'Oscuro', value: 'dark' },
    { label: 'Claro', value: 'light' },
    { label: 'Auto', value: 'auto' }
  ];

  // Idiomas disponibles
  languages: Language[] = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'Français', value: 'fr' },
    { label: 'Deutsch', value: 'de' },
    { label: 'Português', value: 'pt' }
  ];

  // Estados de configuración
  selectedTheme: string = 'dark';
  selectedLanguage: string = 'es';
  pushNotifications: boolean = true;
  emailNotifications: boolean = false;
  analytics: boolean = true;

  constructor() {}

  ngOnInit(): void {
    this.loadSettings();
  }

  /**
   * Carga la configuración guardada desde localStorage
   */
  loadSettings(): void {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.selectedTheme = settings.theme || 'dark';
      this.selectedLanguage = settings.language || 'es';
      this.pushNotifications = settings.pushNotifications ?? true;
      this.emailNotifications = settings.emailNotifications ?? false;
      this.analytics = settings.analytics ?? true;
    }
  }

  /**
   * Guarda la configuración en localStorage
   */
  saveSettings(): void {
    const settings = {
      theme: this.selectedTheme,
      language: this.selectedLanguage,
      pushNotifications: this.pushNotifications,
      emailNotifications: this.emailNotifications,
      analytics: this.analytics
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
    console.log('Configuración guardada:', settings);
  }

  /**
   * Cambia el tema de la aplicación
   */
  changeTheme(theme: string): void {
    this.selectedTheme = theme;
    this.saveSettings();
    
    // Aquí puedes implementar la lógica para cambiar el tema
    document.body.setAttribute('data-theme', theme);
    console.log('Tema cambiado a:', theme);
  }

  /**
   * Cambia el idioma de la aplicación
   */
  changeLanguage(): void {
    this.saveSettings();
    
    // Aquí puedes implementar la lógica para cambiar el idioma
    // Por ejemplo, usando un servicio de traducción
    console.log('Idioma cambiado a:', this.selectedLanguage);
  }

  /**
   * Activa/desactiva las notificaciones push
   */
  togglePushNotifications(): void {
    this.saveSettings();
    console.log('Notificaciones push:', this.pushNotifications ? 'activadas' : 'desactivadas');
  }

  /**
   * Activa/desactiva las notificaciones por email
   */
  toggleEmailNotifications(): void {
    this.saveSettings();
    console.log('Notificaciones email:', this.emailNotifications ? 'activadas' : 'desactivadas');
  }

  /**
   * Activa/desactiva el análisis de uso
   */
  toggleAnalytics(): void {
    this.saveSettings();
    console.log('Análisis de uso:', this.analytics ? 'activado' : 'desactivado');
  }
}