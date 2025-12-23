import { Routes } from '@angular/router';

export const routes: Routes = [

    // 1. Redirección al iniciar: Redirige '/' a '/vacunas'
    { path: '', redirectTo: '/vacunas', pathMatch: 'full' }, 
    
    // 2. Rutas del Módulo Vacunas
    //{ path: 'vacunas', component: VacunaListComponent },
    //{ path: 'vacunas/nuevo', component: VacunaFromComponent },
    //{ path: 'vacunas/editar/:id', component: VacunaFromComponent },
    
    // 3. Ruta comodín para manejar URL no encontradas
    { path: '**', redirectTo: '/vacunas' },
    
    { path: '', redirectTo: '', pathMatch: 'full' },
    {
        path: '',
        loadChildren: () => import('./layouts/web/layout-web-router').then(m => m.WebRoutes)
    },
    {
        path: 'app',
        loadChildren: () => import('./layouts/app/layout-app-router').then(m => m.AppRoutes)
    },
    { path: '**', redirectTo: '' }

];
