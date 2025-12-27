import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AlertaCadenaFrio, AlertaCadenaFrioResponse } from '../../../../core/models/alertaCadenaFrio';
import { AlertasCadenaFrioService } from '../../../../core/services/alertasCadenaFrio.service';
import { AppAlertaCadenaFrioFormComponent } from '../app-alerta-cadena-frio-form/app-alerta-cadena-frio-form.component';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-app-alerta-cadena-frio-list',
  imports: [CommonModule, MatButtonToggleModule, AppAlertaCadenaFrioFormComponent],
  templateUrl: './app-alerta-cadena-frio-list.component.html',
  styleUrl: './app-alerta-cadena-frio-list.component.css'
})
export class AppAlertaCadenaFrioListComponent implements OnInit {
  alertas: AlertaCadenaFrio[] = [];
  error: string = '';

  @ViewChild(AppAlertaCadenaFrioFormComponent) alertaFormModal!: AppAlertaCadenaFrioFormComponent;

  abrirModalNuevo(): void {
    this.alertaFormModal.abrirModal();
  }

  
  abrirModalEditar(id: number): void {
    this.alertaFormModal.abrirModal(id);
  }

  constructor(
    private alertasCadenaFrioService: AlertasCadenaFrioService, 
    private notificationService: NotificationService,
    private authService: AuthService
) { }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.cargarAlertas();
  }

  cargarAlertas() {
    this.alertasCadenaFrioService.obtenerAlertas().subscribe({
      next: (response: AlertaCadenaFrioResponse) => {
        if (response.success && Array.isArray(response.data)) {
          this.alertas = response.data;
          console.log('Alertas cargadas:', this.alertas);
        } else if (response.success && !response.data) {
          this.alertas = [];
        } else {
          this.error = response.mensaje || 'Error al obtener la lista de alertas.';
          this.alertas = [];
        }
      },
      error: (err) => {
        this.error = 'Error de conexión con el servidor.';
        console.error('Error HTTP:', err);
      }
    });
  }

  cambiarEstadoAlerta(id: number | undefined, nuevoEstado: string) {
    if (!id) return;
    this.alertasCadenaFrioService.cambiarEstadoAlerta(id, nuevoEstado).subscribe({
      next: (response: AlertaCadenaFrioResponse) => {
        if (response.success) {
          this.notificationService.success(`Estado de la alerta actualizado a ${nuevoEstado}.`);
          this.cargarAlertas();
        } else {
          this.error = response.mensaje || 'Error al cambiar el estado de la alerta.';
          this.notificationService.warning(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error de servidor al cambiar el estado.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
      }
    });
  }

  eliminarAlerta(id: number | undefined) {
    if (!id) return;
    if (confirm('ADVERTENCIA: ¿Estás seguro de eliminar esta alerta?')) {
      this.alertasCadenaFrioService.eliminarAlerta(id).subscribe({
        next: (response: AlertaCadenaFrioResponse) => {
          if (response.success) {
            this.notificationService.success('Alerta eliminada exitosamente.');
            this.cargarAlertas();
          } else {
            this.error = response.mensaje || 'Error al eliminar la alerta.';
            this.notificationService.warning(this.error);
          }
        },
        error: (err) => {
          this.error = 'Error de servidor al intentar eliminar.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    }
  }
}