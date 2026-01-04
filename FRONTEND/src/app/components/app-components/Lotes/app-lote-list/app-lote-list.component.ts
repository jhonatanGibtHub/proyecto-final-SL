import { AfterViewInit, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Lote, LoteResponse } from '../../../../core/models/lote';
import { LotesService } from '../../../../core/services/lotes.service';
import { AppLoteFormComponent } from '../app-lote-form/app-lote-form.component';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';

@Component({
  selector: 'app-app-lote-list',
  imports: [CommonModule, AppLoteFormComponent],
  templateUrl: './app-lote-list.component.html',
  styleUrls: ['./app-lote-list.component.css']
})
export class AppLoteListComponent implements OnInit, AfterViewInit, OnDestroy {
  lotes: Lote[] = [];
  error: string = '';

  @ViewChild(AppLoteFormComponent) loteFormModal!: AppLoteFormComponent;

  // Arreglo para almacenar todas las suscripciones
  private subscriptions: Subscription[] = [];

  constructor(
    private loteService: LotesService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarLotes();
  }

  ngAfterViewInit(): void {
    // No duplicamos la carga aquí, solo si quieres refrescar al abrir el modal puedes hacerlo allí
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  abrirModalNuevo(): void {
    this.loteFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.loteFormModal.abrirModal(id);
  }

  cargarLotes(): void {
    const sub = this.loteService.obtenerLotes().subscribe({
      next: (response: LoteResponse) => {
        if (response.success && Array.isArray(response.data)) {
          this.lotes = response.data;
          console.log('Lotes cargados:', this.lotes);
        } else if (response.success && !response.data) {
          this.lotes = [];
        } else {
          this.error = response.mensaje || 'Error al obtener la lista de lotes.';
          this.lotes = [];
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error de conexión con el servidor.';
        console.error('Error HTTP:', err);
        this.notificationService.error(this.error);
      }
    });

    this.subscriptions.push(sub);
  }
}