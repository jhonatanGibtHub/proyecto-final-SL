import { Routes } from '@angular/router';
import { VacunaListComponent } from './components/vacuna-list/vacuna-list.component';

// 🛑 IMPORTANTE: Usamos 'VacunaFromComponent' para coincidir con tu clase exportada
import { VacunaFromComponent } from './components/vacuna-from/vacuna-from.component'; 

export const routes: Routes = [

    // 1. Redirección al iniciar: Redirige '/' a '/vacunas'
    { path: '', redirectTo: '/vacunas', pathMatch: 'full' }, 
    
    // 2. Rutas del Módulo Vacunas
    { path: 'vacunas', component: VacunaListComponent },
    { path: 'vacunas/nuevo', component: VacunaFromComponent },
    { path: 'vacunas/editar/:id', component: VacunaFromComponent },
    
    // 3. Ruta comodín para manejar URL no encontradas
    { path: '**', redirectTo: '/vacunas' }
];