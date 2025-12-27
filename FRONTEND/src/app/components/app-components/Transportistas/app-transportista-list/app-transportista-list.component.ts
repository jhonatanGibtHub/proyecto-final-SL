import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transportista, TransportistaResponse } from '../../../../core/models/transportista';
import { TransportistasService } from '../../../../core/services/transportistas.service';
import { AppTransportistaFormComponent } from '../app-transportista-form/app-transportista-form.component';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-app-transportista-list',
  imports: [CommonModule, AppTransportistaFormComponent],
  templateUrl: './app-transportista-list.component.html',
  styleUrl: './app-transportista-list.component.css'
})
export class AppTransportistaListComponent implements OnInit {
  transportistas: Transportista[] = [];
  error: string = '';

  @ViewChild(AppTransportistaFormComponent) transportistaFormModal!: AppTransportistaFormComponent;

  abrirModalNuevo(): void {
    this.transportistaFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.transportistaFormModal.abrirModal(id);
  }
  constructor(private transportistaService: TransportistasService, 
    private notificationService: NotificationService, 
        private authService: AuthService
            ) { }
          
             get isAdmin(): boolean {
              return this.authService.isAdmin();
            }

  ngOnInit(): void {
    this.cargarTransportistas();
  }

  cargarTransportistas() {
    this.transportistaService.obtenerTransportistas().subscribe({
      next: (response: TransportistaResponse) => {
        if (response.success && Array.isArray(response.data)) {
          this.transportistas = response.data;
          console.log('Transportistas cargados:', this.transportistas);
        } else if (response.success && !response.data) {
          this.transportistas = [];
        } else {
          this.error = response.mensaje || 'Error al obtener la lista de transportistas.';
          this.transportistas = [];
        }
      },
      error: (err) => {
        this.error = 'Error de conexión con el servidor.';
        console.error('Error HTTP:', err);
      }
    });
  }
  eliminarTransportista(id: number | undefined) {
    if (!id) return;
    if (confirm('ADVERTENCIA: ¿Estás seguro de eliminar este transportista? Si existen registros asociados, la operación fallará.')) {
      this.transportistaService.eliminarTransportista(id).subscribe({
        next: (response: TransportistaResponse) => {
          if (response.success) {
            this.notificationService.success(
            'Transportista eliminado exitosamente.'
          );
            this.cargarTransportistas();
          } else {
            this.error = response.mensaje || 'Error al eliminar el transportista.';
            this.notificationService.warning(
            this.error
          );
          }
        },
        error: (err) => {
          this.error = 'Error de servidor al intentar eliminar.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(
            mensajeError || this.error
          );
        }
      });
    }
  }
}