import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-web-main',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './web-main.component.html',
  styleUrl: './web-main.component.css'
})
export class WebMainComponent {}
