import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderWebComponent } from '../../shared/header-web/header-web.component';

@Component({
  selector: 'app-web-router',
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderWebComponent
  ],
  templateUrl: './web-router.component.html',
  styleUrl: './web-router.component.css'
})
export class WebRouterComponent {

}
