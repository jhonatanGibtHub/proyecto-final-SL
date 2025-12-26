import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notificacion/notificacion-type.service';

@Component({
  selector: 'app-auth-register',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.css'
})
export class AuthRegisterComponent {
  registerForm: FormGroup;
   error: string = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      is_google_account: [false]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      // Marca TODOS los campos como touched
      this.registerForm.markAllAsTouched();
      return;
    }


    const formData = this.registerForm.value;
    this.authService.registro(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.authService.login(formData).subscribe(
            {
              next: (response) => {
                this.router.navigate(['/auth/app']);
                const mensajeSucces = response.mensaje;
                this.notificationService.success(
                  mensajeSucces
                );
              }
            }
          );
        }
      },
      error: (err) => {
        this.error = "No se pudo conectar con la base de datos.";
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(
          mensajeError || this.error
        );
      }
    });

  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;

      switch (fieldName) {
        case 'password':
          return `Mínimo ${requiredLength} caracteres`;
        case 'nombre':
          return `Mínimo ${requiredLength} caracteres`;
        default:
          return `Mínimo ${requiredLength} caracteres`;
      }
    }
    return '';
  }

}
