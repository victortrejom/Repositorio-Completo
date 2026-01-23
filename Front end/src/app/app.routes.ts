import { Routes } from '@angular/router';
import { AuthGuard } from './guardservice/auth.guard';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.Login) },
  { path: 'home', loadComponent: () => import('./components/home/home').then(m => m.Home), canActivate: [AuthGuard] },
  { path: 'necesidades', loadComponent: () => import('./components/graficas/graficas').then(m => m.Graficas), canActivate: [AuthGuard] },
  { path: 'consulta', loadComponent: () => import('./components/graficas-publica/graficas-publica').then(m => m.GraficasPublica) },
  { path: 'preguntas', loadComponent: () => import('./components/preguntas-frecuentes/preguntas-frecuentes').then(m => m.PreguntasFrecuentes) }
];

// @NgModule({
//     imports: [
//         CommonModule,
//         BrowserModule,
//         RouterModule.forRoot(routes, { useHash: true })],
//     exports: [RouterModule]
// })
