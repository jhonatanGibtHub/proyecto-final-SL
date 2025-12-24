import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-auth-register-google',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './auth-register-google.component.html',
  styleUrl: './auth-register-google.component.css'
})
export class AuthRegisterGoogleComponent {

  email: string = '';
  picture: string = '';
  nombres: string = '';

  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
    });

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { email: string, picture: string, name: string };

    if (state) {
      this.nombres = state.name;
      this.email = state.email;
      this.picture = state.picture;
      this.registerForm.patchValue({ nombre: state.name });
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
     
      this.errorMessage = '';
      this.successMessage = '';

      const formData = {
        ...this.registerForm.value,
        email: this.email,
        picture: this.picture,
        is_google_account: true,
        password: this.generateRandomPassword()
      };

      this.authService.registro(formData).subscribe({
        next: (response) => {
         
          if (response.success) {
            this.successMessage = response.mensaje || 'Usuario registrado exitosamente con Google';
            
              this.router.navigate(['/app']);
            
          } else {
            this.errorMessage = response.mensaje || 'Error al registrar usuario';
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.mensaje || 'Error al registrar usuario con Google';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  get nombre() { return this.registerForm.get('nombre'); }
  get password() { return this.registerForm.get('password'); }

  generateRandomPassword(): string {
    const length = 20;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let password = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  }
} 
