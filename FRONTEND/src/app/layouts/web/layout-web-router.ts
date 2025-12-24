import { Routes } from '@angular/router';
import { WebMainComponent } from '../../components/web-components/web-main/web-main.component';
import { WebRouterComponent } from './web-router.component';

export const WebRoutes: Routes = [
  {
    path: '', component: WebRouterComponent,
  
    children: [
      { path: '', component: WebMainComponent},
    ]
  }
];