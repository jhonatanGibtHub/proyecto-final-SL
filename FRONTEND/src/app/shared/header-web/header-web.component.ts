import { Component } from '@angular/core';
import { ButtonColorThemeComponent } from '../button-color-theme/button-color-theme.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-web',
  imports: [
    RouterLink
  ],
  templateUrl: './header-web.component.html',
  styleUrl: './header-web.component.css'
})
export class HeaderWebComponent {

}
