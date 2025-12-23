import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router'; // 🛑 NECESARIO
import { routes } from './app.routes'; // 🛑 NECESARIO
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    
    // 🛑 CORRECTO: Esto carga la configuración de rutas
    provideRouter(routes) ,
    provideHttpClient(withFetch())
  ]
};