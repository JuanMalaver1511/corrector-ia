import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';

interface User {
  id: number;
  usuario: string;
  fechaCreacion: Date;
  estado: 'activo' | 'suspendido';
}

@Component({
  selector: 'app-crear-user',
  imports: [Navbar, CommonModule, ReactiveFormsModule],
  templateUrl: './crear-user.html',
  styleUrl: './crear-user.css',
})
export class CrearUser {
  userForm: FormGroup;
  usuarios: User[] = [];
  nextId = 1;
  mostrarPassword = false;
  mostrarConfirmPassword = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.cargarUsuarios();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  cargarUsuarios(): void {
    const usuariosGuardados = localStorage.getItem('usuarios');
    if (usuariosGuardados) {
      this.usuarios = JSON.parse(usuariosGuardados);
      if (this.usuarios.length > 0) {
        this.nextId = Math.max(...this.usuarios.map(u => u.id)) + 1;
      }
    }
  }

  guardarUsuarios(): void {
    localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
  }

  crearUsuario(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.userForm.invalid) {
      this.mensajeError = 'Por favor, completa todos los campos correctamente.';
      this.marcarCamposComoTocados();
      return;
    }

    const usuarioExiste = this.usuarios.some(
      u => u.usuario.toLowerCase() === this.userForm.value.usuario.toLowerCase()
    );

    if (usuarioExiste) {
      this.mensajeError = 'El nombre de usuario ya existe.';
      return;
    }

    const nuevoUsuario: User = {
      id: this.nextId++,
      usuario: this.userForm.value.usuario,
      fechaCreacion: new Date(),
      estado: 'activo'
    };

    this.usuarios.unshift(nuevoUsuario);
    this.guardarUsuarios();
    this.mensajeExito = 'Usuario creado exitosamente.';
    this.userForm.reset();
    
    setTimeout(() => {
      this.mensajeExito = '';
    }, 3000);
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  toggleEstado(usuario: User): void {
    usuario.estado = usuario.estado === 'activo' ? 'suspendido' : 'activo';
    this.guardarUsuarios();
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.usuarios = this.usuarios.filter(u => u.id !== id);
      this.guardarUsuarios();
      this.mensajeExito = 'Usuario eliminado exitosamente.';
      setTimeout(() => {
        this.mensajeExito = '';
      }, 3000);
    }
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleMostrarConfirmPassword(): void {
    this.mostrarConfirmPassword = !this.mostrarConfirmPassword;
  }

  get usuario() {
    return this.userForm.get('usuario');
  }

  get password() {
    return this.userForm.get('password');
  }

  get confirmPassword() {
    return this.userForm.get('confirmPassword');
  }
}