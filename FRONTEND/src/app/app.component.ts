import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacionComponent } from "./shared/notificacion/notificacion.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificacionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'FRONTEND';
  
}
