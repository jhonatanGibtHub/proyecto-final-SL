import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-register-google',
  imports: [
    CommonModule,
    RouterLink
],
  templateUrl: './auth-register-google.component.html',
  styleUrl: './auth-register-google.component.css'
})
export class AuthRegisterGoogleComponent {

   email: String = '';
  picture: String= '';
  nombres: String= '';

  constructor(private router: Router) {
      
    const navigation = this.router.getCurrentNavigation();

    const state = navigation?.extras.state as { email: string, picture: string, name: string };

    if (state) {
      this.nombres = state.name;
      this.email = state.email;
      this.picture = state.picture;
    }
  }
} 
