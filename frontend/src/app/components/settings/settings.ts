import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';

interface Theme {
  label: string;
  value: string;
}

interface Language {
  label: string;
  value: string;
}

interface UserSettings {
  theme: string;
  language: string;
  pushNotifications: boolean;
  emailNotifications: boolean;
  analytics: boolean;
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

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.loadSettings();
    this.applyTheme(this.selectedTheme);
  }

  /**
   * Carga la configuración guardada desde localStorage
   */
  loadSettings(): void {
    if (!this.isBrowser) return;

    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings: UserSettings = JSON.parse(savedSettings);
        this.selectedTheme = settings.theme || 'light';
        this.selectedLanguage = settings.language || 'es';
        this.pushNotifications = settings.pushNotifications ?? true;
        this.emailNotifications = settings.emailNotifications ?? false;
        this.analytics = settings.analytics ?? true;
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  }

  /**
   * Guarda la configuración en localStorage
   */
  saveSettings(): void {
    if (!this.isBrowser) return;

    try {
      const settings: UserSettings = {
        theme: this.selectedTheme,
        language: this.selectedLanguage,
        pushNotifications: this.pushNotifications,
        emailNotifications: this.emailNotifications,
        analytics: this.analytics
      };
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    }
  }

  /**
   * Cambia el tema de la aplicación
   */
  changeTheme(theme: string): void {
    this.selectedTheme = theme;
    this.applyTheme(theme);
    this.saveSettings();
  }

  /**
   * Aplica el tema visualmente
   */
  applyTheme(theme: string): void {
    if (!this.isBrowser) return;

    const body = document.body;
    const root = document.documentElement;

    // Remover clases de tema anteriores
    body.classList.remove('theme-light', 'theme-dark', 'theme-auto');

    if (theme === 'auto') {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    // Aplicar el tema
    body.classList.add(`theme-${theme}`);
    root.setAttribute('data-theme', theme);

    // Cambiar colores del documento según el tema
    if (theme === 'dark') {
      root.style.setProperty('--bg-color', '#0a0a0a');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--border-color', '#27272a');
      body.style.backgroundColor = '#0a0a0a';
    } else {
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#1a1a1a');
      root.style.setProperty('--border-color', '#e8e8e8');
      body.style.backgroundColor = '#ffffff';
    }
  }

  /**
   * Cambia el idioma de la aplicación
   */
  changeLanguage(): void {
    this.saveSettings();
    
    // Aquí puedes implementar la lógica para cambiar el idioma
    // Por ejemplo, usando TranslateService si usas ngx-translate
    console.log('Idioma cambiado a:', this.selectedLanguage);
    
    // Ejemplo de notificación visual (opcional)
    this.showNotification(`Idioma cambiado a ${this.getLanguageLabel()}`);
  }

  /**
   * Obtiene el label del idioma seleccionado
   */
  getLanguageLabel(): string {
    const lang = this.languages.find(l => l.value === this.selectedLanguage);
    return lang ? lang.label : this.selectedLanguage;
  }

  /**
   * Activa/desactiva las notificaciones push
   */
  togglePushNotifications(): void {
    this.saveSettings();
    const status = this.pushNotifications ? 'activadas' : 'desactivadas';
    console.log('Notificaciones push:', status);
    this.showNotification(`Notificaciones push ${status}`);
  }

  /**
   * Activa/desactiva las notificaciones por email
   */
  toggleEmailNotifications(): void {
    this.saveSettings();
    const status = this.emailNotifications ? 'activadas' : 'desactivadas';
    console.log('Notificaciones email:', status);
    this.showNotification(`Notificaciones por email ${status}`);
  }

  /**
   * Activa/desactiva el análisis de uso
   */
  toggleAnalytics(): void {
    this.saveSettings();
    const status = this.analytics ? 'activado' : 'desactivado';
    console.log('Análisis de uso:', status);
    this.showNotification(`Análisis de uso ${status}`);
  }

  /**
   * Muestra una notificación temporal (opcional)
   */
  private showNotification(message: string): void {
    if (!this.isBrowser) return;
    
    // Aquí puedes implementar un sistema de notificaciones más sofisticado
    // Por ahora solo usamos console.log
    console.log('✓', message);
  }
}