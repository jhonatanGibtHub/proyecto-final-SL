import { Routes } from '@angular/router';
import { AuthLoginComponent } from '../../components/auth-components/auth-login/auth-login.component';
import { AuthRouterComponent } from './auth-router.component';
import { AuthRegisterComponent } from '../../components/auth-components/auth-register/auth-register.component';
import { AuthRegisterGoogleComponent } from '../../components/auth-components/auth-register-google/auth-register-google.component';

export const AuthRoutes: Routes = [
  {
    path: '', component: AuthRouterComponent,
    
    children: [
     { path: 'login', component: AuthLoginComponent},
     { path: 'register', component: AuthRegisterComponent},
     { path: 'google', component: AuthRegisterGoogleComponent},
      
    ]
  }
];