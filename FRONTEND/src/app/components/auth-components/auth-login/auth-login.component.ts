import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environment/environment';
import { AuthService } from '../../../services/auth/auth.service';
import { AuthGoogleService } from '../../../services/auth/auth-google.service';
import { jwtDecode } from 'jwt-decode';

declare const google: any;

@Component({
  selector: 'app-auth-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.css'
})
export class AuthLoginComponent implements OnInit {

  loginForm!: FormGroup;

  loading: boolean = false;
  error: string = '';
  returnUrl: string = '/libros';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private authGoogleService: AuthGoogleService,
    private route: ActivatedRoute
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {

    // Obtener returnUrl de los query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/libros';

    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.onCredential(response),
    });

    google.accounts.id.renderButton(
      document.getElementById('google-button'),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        locale: 'es',
        logo_alignment: 'center'
      }
    );
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al iniciar sesión';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onCredential(response: any) {
    const idToken = response.credential;

    const decodedToken: any = jwtDecode(idToken);

    console.log(decodedToken);

    this.router.navigate(['auth/google'], {
      state: {
        email: decodedToken.email,
        picture: decodedToken.picture,
        name: decodedToken.name
      }
    });
  }


  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      return 'Mínimo 6 caracteres';
    }
    return '';
  }


}