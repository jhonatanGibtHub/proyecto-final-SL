import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lote, LoteResponse } from '../../../../core/models/lote';
import { LotesService } from '../../../../core/services/lotes.service';
import { AppLoteFormComponent } from '../app-lote-form/app-lote-form.component';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';

@Component({
  selector: 'app-app-lote-list',
  imports: [CommonModule, AppLoteFormComponent],
  templateUrl: './app-lote-list.component.html',
  styleUrl: './app-lote-list.component.css'
})
export class AppLoteListComponent implements OnInit {
  lotes: Lote[] = [];
  error: string = '';

  @ViewChild(AppLoteFormComponent) loteFormModal!: AppLoteFormComponent;

  abrirModalNuevo(): void {
    this.loteFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.loteFormModal.abrirModal(id);
  }

  constructor(private loteService: LotesService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.cargarLotes();
  }

  cargarLotes() {
    this.loteService.obtenerLotes().subscribe({
      next: (response: LoteResponse) => {
        if (response.success && Array.isArray(response.data)) {
          this.lotes = response.data;
          console.log('Lotes cargados:', this.lotes);
        } else if (response.success && !response.data) {
          this.lotes = [];
        } else {
          this.error = response.mensaje || 'Error al obtener la lista de lotes.';
          this.lotes = [];
        }
      },
      error: (err) => {
        this.error = 'Error de conexión con el servidor.';
        console.error('Error HTTP:', err);
      }
    });
  }
}