import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroMovimiento, RegistroMovimientoResponse } from '../../../../core/models/registroMovimiento';
import { RegistroMovimientoService } from '../../../../core/services/registroMovimiento.service';
import { AppRegistroMovimientoFormComponent } from '../app-registro-movimiento-form/app-registro-movimiento-form.component';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-app-registro-movimiento-list',
  imports: [CommonModule, AppRegistroMovimientoFormComponent],
  templateUrl: './app-registro-movimiento-list.component.html',
  styleUrl: './app-registro-movimiento-list.component.css'
})
export class AppRegistroMovimientoListComponent implements OnInit {

  movimientos: RegistroMovimiento[] = [];
  loading: boolean = false;
  error: string = '';

  @ViewChild(AppRegistroMovimientoFormComponent) movimientoFormModal!: AppRegistroMovimientoFormComponent;

  abrirModalNuevo(): void {
    this.movimientoFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.movimientoFormModal.abrirModal(id);
  }

  constructor(
    private readonly movimientoService: RegistroMovimientoService,
    private readonly notificationService: NotificationService, private authService: AuthService
      ) { }
    
       get isAdmin(): boolean {
        return this.authService.isAdmin();
      }

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  cargarMovimientos() {
    this.loading = true;
    this.error = '';
    this.movimientoService.obtenerMovimientos().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && Array.isArray(response.data)) {
          this.movimientos = response.data;
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar los movimientos: Fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
      }
    });
  }

  onMovimientoGuardado() {
    this.cargarMovimientos();
  }

  eliminarMovimiento(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este movimiento?')) {
      this.movimientoService.eliminarMovimiento(id).subscribe({
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
          this.error = 'Error al eliminar el movimiento: Fallo de conexión.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    }
  }
}