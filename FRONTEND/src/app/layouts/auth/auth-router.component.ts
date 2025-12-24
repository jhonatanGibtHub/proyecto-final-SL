import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderAuthComponent } from "../../shared/header-auth/header-auth.component";

@Component({
  selector: 'app-auth-router',
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderAuthComponent
],
  templateUrl: './auth-router.component.html',
  styleUrl: './auth-router.component.css'
})
export class AuthRouterComponent {

}
