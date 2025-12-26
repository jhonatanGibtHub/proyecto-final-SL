import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ubicacion, UbicacionResponse } from '../../../../core/models/ubicacion';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';
import { AppUbicacionFormComponent } from '../app-ubicacion-form/app-ubicacion-form.component';
@Component({
  selector: 'app-app-ubicacion-list',
  imports: [CommonModule, AppUbicacionFormComponent],
  templateUrl: './app-ubicacion-list.component.html',
  styleUrl: './app-ubicacion-list.component.css'
})
export class AppUbicacionListComponent implements OnInit {
  ubicaciones: Ubicacion[] = [];
  error: string = '';

  @ViewChild(AppUbicacionFormComponent) ubicacionFormModal!: AppUbicacionFormComponent;

  abrirModalNuevo(): void {
    this.ubicacionFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.ubicacionFormModal.abrirModal(id);
  }
  constructor(private ubicacionService: UbicacionesService) {}

  ngOnInit(): void {
    this.cargarUbicaciones();
  }

  cargarUbicaciones() {
    this.ubicacionService.obtenerUbicaciones().subscribe({
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
  }
  eliminarUbicacion(id: number | undefined) {
    if (!id) return;
    if (confirm('ADVERTENCIA: ¿Estás seguro de eliminar esta ubicación? Si existen registros asociados, la operación fallará.')) {
      this.ubicacionService.eliminarUbicacion(id).subscribe({
        next: (response: UbicacionResponse) => {
          if (response.success) {
            alert('Ubicación eliminada exitosamente.');
            this.cargarUbicaciones();
          } else {
            this.error = response.mensaje || 'Error al eliminar la ubicación.';
            alert(this.error);
          }
        },
        error: (err) => {
          this.error = 'Error de servidor al intentar eliminar.';
          console.error('Error HTTP:', err);
        }
      });
    }
  }
}