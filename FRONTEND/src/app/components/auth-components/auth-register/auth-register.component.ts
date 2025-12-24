import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-register',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.css'
})
export class AuthRegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.registerForm.value;

      this.authService.registro(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = response.mensaje || 'Usuario registrado exitosamente';
            // Optionally navigate to login after a delay
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 2000);
          } else {
            this.errorMessage = response.mensaje || 'Error al registrar usuario';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.mensaje || 'Error al registrar usuario';
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
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
}
