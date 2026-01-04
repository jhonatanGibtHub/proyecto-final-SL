import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ubicacion, UbicacionResponse } from '../../../../core/models/ubicacion';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';
import { AppUbicacionFormComponent } from '../app-ubicacion-form/app-ubicacion-form.component';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-app-ubicacion-list',
  imports: [CommonModule, AppUbicacionFormComponent],
  templateUrl: './app-ubicacion-list.component.html',
  styleUrl: './app-ubicacion-list.component.css'
})
export class AppUbicacionListComponent implements OnInit, OnDestroy {
  ubicaciones: Ubicacion[] = [];
  error: string = '';

  private subscriptions: Subscription[] = [];

  @ViewChild(AppUbicacionFormComponent) ubicacionFormModal!: AppUbicacionFormComponent;

  constructor(
    private ubicacionService: UbicacionesService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.cargarUbicaciones();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  abrirModalNuevo(): void {
    this.ubicacionFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.ubicacionFormModal.abrirModal(id);
  }

  cargarUbicaciones() {
    const sub = this.ubicacionService.obtenerUbicaciones().subscribe({
      next: (response: UbicacionResponse) => {
        if (response.success && Array.isArray(response.data)) {
          this.ubicaciones = response.data;
          console.log('Ubicaciones cargadas:', this.ubicaciones);
        } else if (response.success && !response.data) {
          this.ubicaciones = [];
        } else {
          this.error = response.mensaje || 'Error al obtener la lista de ubicaciones.';
          this.ubicaciones = [];
        }
      },
      error: (err) => {
        this.error = 'Error de conexión con el servidor.';
        console.error('Error HTTP:', err);
      }
    });

    this.subscriptions.push(sub);
  }

  eliminarUbicacion(id: number | undefined) {
    if (!id) return;
    if (confirm('ADVERTENCIA: ¿Estás seguro de eliminar esta ubicación? Si existen registros asociados, la operación fallará.')) {
      const sub = this.ubicacionService.eliminarUbicacion(id).subscribe({
        next: (response: UbicacionResponse) => {
          if (response.success) {
            this.notificationService.success('Ubicación eliminada exitosamente.');
            this.cargarUbicaciones();
          } else {
            this.error = response.mensaje || 'Error al eliminar la ubicación.';
            this.notificationService.warning(this.error);
          }
        },
        error: (err) => {
          this.error = 'Error de servidor al intentar eliminar.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
      this.subscriptions.push(sub);
    }
  }
}