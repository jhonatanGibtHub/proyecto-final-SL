import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicionTemp, MedicionTempResponse } from '../../../../core/models/medicionTemp';
import { MedicionesTempService } from '../../../../core/services/medicionesTemp.service';
import { AppMedicionTempFormComponent } from '../app-medicion-temp-form/app-medicion-temp-form.component';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-app-medicion-temp-list',
  imports: [CommonModule, AppMedicionTempFormComponent],
  templateUrl: './app-medicion-temp-list.component.html',
  styleUrls: ['./app-medicion-temp-list.component.css']
})
export class AppMedicionTempListComponent implements OnInit, OnDestroy {
  mediciones: MedicionTemp[] = [];
  error: string = '';

  @ViewChild(AppMedicionTempFormComponent) medicionFormModal!: AppMedicionTempFormComponent;

  // Arreglo para almacenar todas las suscripciones
  private subscriptions: Subscription[] = [];

  constructor(
    private medicionService: MedicionesTempService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.cargarMediciones();
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones al destruir el componente
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  abrirModalNuevo(): void {
    this.medicionFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.medicionFormModal.abrirModal(id);
  }

  cargarMediciones(): void {
    const sub = this.medicionService.obtenerMediciones().subscribe({
      next: (response: MedicionTempResponse) => {
        if (response.success && Array.isArray(response.data)) {
          this.mediciones = response.data;
          console.log('Mediciones cargadas:', this.mediciones);
        } else if (response.success && !response.data) {
          this.mediciones = [];
        } else {
          this.error = response.mensaje || 'Error al obtener la lista de mediciones.';
          this.mediciones = [];
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error de conexión con el servidor.';
        console.error('Error HTTP:', err);
        this.notificationService.error(this.error);
      }
    });

    this.subscriptions.push(sub);
  }

  eliminarMedicionTemp(id: number): void {
    if (!confirm('¿Está seguro de que desea eliminar esta medición?')) return;

    const sub = this.medicionService.eliminarMedicion(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success('Medición eliminada correctamente.');
          this.cargarMediciones();
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al eliminar la medición: fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
        console.error('Error HTTP al eliminar:', err);
      }
    });

    this.subscriptions.push(sub);
  }
}