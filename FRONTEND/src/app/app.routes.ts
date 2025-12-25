import { Routes } from '@angular/router';

export const routes: Routes = [

    { path: '', redirectTo: '', pathMatch: 'full' },

    {
        path: '',
        loadChildren: () => import('./layouts/web/layout-web-router').then(m => m.WebRoutes)
    },

    {
        path: 'app',
        loadChildren: () => import('./layouts/app/layout-app-router').then(m => m.AppRoutes)
    },

    {
        path: 'auth',
        loadChildren: () => import('./layouts/auth/layout-auth-router').then(m => m.AuthRoutes)
    },
    
    { path: '**', redirectTo: '' }

];

