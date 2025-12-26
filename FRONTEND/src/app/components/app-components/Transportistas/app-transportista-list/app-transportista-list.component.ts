import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transportista, TransportistaResponse } from '../../../../core/models/transportista';
import { TransportistasService } from '../../../../core/services/transportistas.service';
import { AppTransportistaFormComponent } from '../app-transportista-form/app-transportista-form.component';

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
  constructor(private transportistaService: TransportistasService) {}

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
            alert('Transportista eliminado exitosamente.');
            this.cargarTransportistas();
          } else {
            this.error = response.mensaje || 'Error al eliminar el transportista.';
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