import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Inicio } from './components/inicio/inicio';
import { Dashboard } from './components/dashboard/dashboard';
import { StyleEditor } from './components/style-editor/style-editor';
import { Component } from '@angular/compiler';
import { StyleCustomization } from './components/style-customization/style-customization';
import { Questionnaires } from './components/questionnaires/questionnaires';
import { Paraphraser } from './components/paraphraser/paraphraser';
import { Profile } from './components/profile/profile';
import { Settings } from './components/settings/settings';
import { AuthGuard } from './guards/auth-guard';

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
    path: 'inicio',
    component: Inicio,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [AuthGuard]
  },
  {
    path: 'style-editor',
    component: StyleEditor
  },

  {
  path: 'style-customization',
  component: StyleCustomization
  },
  {
    path: 'questionnaires',
    component: Questionnaires,
    canActivate: [AuthGuard]
  },
  {
    path: 'paraphraser',
    component: Paraphraser,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [AuthGuard]
  },
  { 
    path: 'settings',
    component: Settings,
    canActivate: [AuthGuard]
  },

    {
    path: '**',
    redirectTo: 'login'
  }

];
