import { Routes } from '@angular/router';
import { AppMainComponent } from '../../components/app-components/app-main/app-main.component';
import { AppRouterComponent } from './app-router.component';
import { AuthGuard } from '../../core/guards/Auth.guard';
import { AppVacunaListComponent } from '../../components/app-components/Vacunas/app-vacuna-list/app-vacuna-list.component';

export const AppRoutes: Routes = [
  {
    path: '', component: AppRouterComponent, canActivate: [AuthGuard],
    
    children: [
     { path: '', component: AppMainComponent, canActivate: [AuthGuard]},
     { path: 'vacunas', component: AppVacunaListComponent, canActivate: [AuthGuard]},

      
    ]
  }
];