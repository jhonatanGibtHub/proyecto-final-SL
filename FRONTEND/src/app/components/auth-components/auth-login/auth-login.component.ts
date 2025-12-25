import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environment/environment';
import { AuthService } from '../../../core/services/auth/auth.service';

declare const google: any;

@Component({
  selector: 'app-auth-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.css'
})
export class AuthLoginComponent implements OnInit {

  loginForm!: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      is_google_account: [false]
    });
  }

  ngOnInit(): void {
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
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.router.navigate(['/app']);
      }
    });
  }

  onCredential(response: any) {
    const idToken = response.credential;
    this.authService.loginGoogle(idToken).subscribe({
      next: (token) => {
        this.router.navigate(['/app']);
      }
    });
  }
}