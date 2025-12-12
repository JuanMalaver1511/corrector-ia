import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { StyleEditor } from './components/style-editor/style-editor';
import { Component } from '@angular/compiler';
import { StyleCustomization } from './components/style-customization/style-customization';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'style-editor',
    component: StyleEditor
  },
  {
  path: 'style-customization',
  component: StyleCustomization
  }

];
