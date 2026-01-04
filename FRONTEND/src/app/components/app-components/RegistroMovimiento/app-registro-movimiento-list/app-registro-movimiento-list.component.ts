import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RegistroMovimiento, RegistroMovimientoResponse } from '../../../../core/models/registroMovimiento';
import { RegistroMovimientoService } from '../../../../core/services/registroMovimiento.service';
import { AppRegistroMovimientoFormComponent } from '../app-registro-movimiento-form/app-registro-movimiento-form.component';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-app-registro-movimiento-list',
  imports: [CommonModule, AppRegistroMovimientoFormComponent],
  templateUrl: './app-registro-movimiento-list.component.html',
  styleUrls: ['./app-registro-movimiento-list.component.css']
})
export class AppRegistroMovimientoListComponent implements OnInit, OnDestroy {

  movimientos: RegistroMovimiento[] = [];
  error: string = '';

  @ViewChild(AppRegistroMovimientoFormComponent) movimientoFormModal!: AppRegistroMovimientoFormComponent;

  // Arreglo para manejar todas las suscripciones
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly movimientoService: RegistroMovimientoService,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService
  ) { }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  abrirModalNuevo(): void {
    this.movimientoFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.movimientoFormModal.abrirModal(id);
  }

  cargarMovimientos(): void {
    this.error = '';
    const sub = this.movimientoService.obtenerMovimientos().subscribe({
      next: (response: RegistroMovimientoResponse) => {
        if (response.success && Array.isArray(response.data)) {
          this.movimientos = response.data;
          console.log('Movimientos cargados:', this.movimientos);
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar los movimientos: fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
      }
    });

    this.subscriptions.push(sub);
  }

  onMovimientoGuardado(): void {
    this.cargarMovimientos();
  }

  eliminarMovimiento(id: number): void {
    if (!confirm('¿Está seguro de que desea eliminar este movimiento?')) return;

    const sub = this.movimientoService.eliminarMovimiento(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success('Movimiento eliminado correctamente.');
          this.cargarMovimientos();
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al eliminar el movimiento: fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
      }
    });

    this.subscriptions.push(sub);
  }
}