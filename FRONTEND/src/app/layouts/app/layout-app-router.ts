import { Routes } from '@angular/router';
import { AppMainComponent } from '../../components/app-components/app-main/app-main.component';
import { AppRouterComponent } from './app-router.component';

export const AppRoutes: Routes = [
  {
    path: '', component: AppRouterComponent,
    
    children: [
     { path: 'main', component: AppMainComponent},
      
    ]
  }
];