import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicionTemp, MedicionTempResponse } from '../../../../core/models/medicionTemp';
import { MedicionesTempService } from '../../../../core/services/medicionesTemp.service';
import { AppMedicionTempFormComponent } from '../app-medicion-temp-form/app-medicion-temp-form.component';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';

@Component({
  selector: 'app-app-medicion-temp-list',
  imports: [CommonModule, AppMedicionTempFormComponent],
  templateUrl: './app-medicion-temp-list.component.html',
  styleUrl: './app-medicion-temp-list.component.css'
})
export class AppMedicionTempListComponent implements OnInit {
  mediciones: MedicionTemp[] = [];
  error: string = '';

  @ViewChild(AppMedicionTempFormComponent) medicionFormModal!: AppMedicionTempFormComponent;

  abrirModalNuevo(): void {
    this.medicionFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.medicionFormModal.abrirModal(id);
  }

  constructor(private medicionService: MedicionesTempService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.cargarMediciones();
  }

  cargarMediciones() {
    this.medicionService.obtenerMediciones().subscribe({
      next: (response: MedicionTempResponse) => {
        if (response.success && Array.isArray(response.data)) {
          this.mediciones = response.data;
          console.log('Mediciones cargadas:', this.mediciones);
        } else if (response.success && !response.data) {
          this.mediciones = [];
        } else {
          this.error = response.mensaje || 'Error al obtener la lista de mediciones.';
          this.mediciones = [];
        }
      },
      error: (err) => {
        this.error = 'Error de conexión con el servidor.';
        console.error('Error HTTP:', err);
      }
    });
  }

  eliminarMedicionTemp(id: number) {
    if (confirm('¿Está seguro de que desea eliminar esta Medicion?')) {
      this.medicionService.eliminarMedicion(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Medicion eliminado correctamente.');
            this.cargarMediciones();
          } else if (response.error) {
            this.error = response.error;
            this.notificationService.error(this.error);
          }
        },
        error: (err) => {
          this.error = 'Error al eliminar la Medicion: Fallo de conexión.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    }
  }

}