import { Routes } from '@angular/router';
import { AuthLoginComponent } from '../../components/auth-components/auth-login/auth-login.component';
import { AuthRouterComponent } from './auth-router.component';
import { AuthRegisterComponent } from '../../components/auth-components/auth-register/auth-register.component';
import { NoAuthGuard } from '../../core/guards/NoAuth.guard';

export const AuthRoutes: Routes = [
  {
    path: '', component: AuthRouterComponent, canActivate: [NoAuthGuard],
    children: [
     { path: 'login', component: AuthLoginComponent, canActivate: [NoAuthGuard]},
     { path: 'register', component: AuthRegisterComponent, canActivate: [NoAuthGuard]}, 
    ]
  }
];