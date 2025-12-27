import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vacuna, VacunaResponse } from '../../../../core/models/vacuna';
import { VacunasService } from '../../../../core/services/vacunas.service';
import { AppVacunaFormComponent } from '../app-vacuna-form/app-vacuna-form.component';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-app-vacuna-list',
  imports: [CommonModule, AppVacunaFormComponent],
  templateUrl: './app-vacuna-list.component.html',
  styleUrl: './app-vacuna-list.component.css'
})
export class AppVacunaListComponent implements OnInit {
  vacunas: Vacuna[] = [];
  error: string = '';

  @ViewChild(AppVacunaFormComponent) vacunaFormModal!: AppVacunaFormComponent;

  abrirModalNuevo(): void {
    this.vacunaFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.vacunaFormModal.abrirModal(id);
  }
  constructor(private vacunaService: VacunasService, private notificationService: NotificationService, 
          private authService: AuthService
              ) { }
            
               get isAdmin(): boolean {
                return this.authService.isAdmin();
              }

  ngOnInit(): void {
    this.cargarVacunas();
  }

  cargarVacunas() {
    this.vacunaService.obtenerVacunas().subscribe({
      next: (response: VacunaResponse) => {
        if (response.success && Array.isArray(response.data)) {
          this.vacunas = response.data;
        } else if (response.success && !response.data) {
          this.vacunas = [];
        } else {
          this.error = 'Error al obtener la lista de vacunas.';
          this.vacunas = [];
        }
      },
      error: (err) => {
          this.error = "Se ha perdido la conexion con la base de datos.";
          this.notificationService.error(
            this.error
          );
      }
    });
  }
  eliminarVacuna(id: number | undefined) {
    if (!id) return;
    if (confirm('ADVERTENCIA: ¿Estás seguro de eliminar esta vacuna? Si existen lotes asociados, la operación fallará.')) {
      this.vacunaService.eliminarVacuna(id).subscribe({
        next: (response: VacunaResponse) => {
          if (response.success) {
            this.notificationService.success("Vacuna eliminada exitosamente.");
            this.cargarVacunas();
          } else {
            this.error = response.mensaje || 'Error al eliminar la vacuna.';
            this.notificationService.warning(this.error);
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