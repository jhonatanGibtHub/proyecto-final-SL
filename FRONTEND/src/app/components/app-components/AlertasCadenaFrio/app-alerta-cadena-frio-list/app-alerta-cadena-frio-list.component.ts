import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AlertaCadenaFrio, AlertaCadenaFrioResponse } from '../../../../core/models/alertaCadenaFrio';
import { AlertasCadenaFrioService } from '../../../../core/services/alertasCadenaFrio.service';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-app-alerta-cadena-frio-list',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule],
  templateUrl: './app-alerta-cadena-frio-list.component.html',
  styleUrls: ['./app-alerta-cadena-frio-list.component.css']
})
export class AppAlertaCadenaFrioListComponent implements OnInit, OnDestroy {

  alertas: AlertaCadenaFrio[] = [];
  error: string = '';
  private subscriptions: Subscription[] = [];

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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  private cargarAlertas(): void {
    const sub = this.alertasCadenaFrioService.obtenerAlertas().subscribe({
      next: (response: AlertaCadenaFrioResponse) => {
        if (response.success && Array.isArray(response.data)) this.alertas = response.data;
        else this.alertas = [];
      },
      error: (err) => {
        this.error = 'Error de conexión con el servidor.';
        console.error('Error HTTP:', err);
      }
    });
    this.subscriptions.push(sub);
  }

  cambiarEstadoAlerta(id: number | undefined, nuevoEstado: string) {
    if (!id) return;

    const sub = this.alertasCadenaFrioService.cambiarEstadoAlerta(id, nuevoEstado).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(`Estado de la alerta actualizado a ${nuevoEstado}.`);
          this.cargarAlertas();
        } else {
          this.notificationService.warning(response.mensaje || 'Error al cambiar el estado.');
        }
      },
      error: (err) => {
        this.notificationService.error(err.error?.mensaje || 'Error al cambiar estado.');
      }
    });
    this.subscriptions.push(sub);
  }

  eliminarAlerta(id: number | undefined) {
    if (!id || !confirm('ADVERTENCIA: ¿Estás seguro de eliminar esta alerta?')) return;

    const sub = this.alertasCadenaFrioService.eliminarAlerta(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success('Alerta eliminada exitosamente.');
          this.cargarAlertas();
        } else {
          this.notificationService.warning(response.mensaje || 'Error al eliminar la alerta.');
        }
      },
      error: (err) => this.notificationService.error(err.error?.mensaje || 'Error al eliminar la alerta.')
    });
    this.subscriptions.push(sub);
  }
}