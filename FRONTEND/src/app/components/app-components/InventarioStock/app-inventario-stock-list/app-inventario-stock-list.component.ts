import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventarioStock, InventarioStockResponse } from '../../../../core/models/inventarioStock';
import { InventarioStockService } from '../../../../core/services/inventarioStock.service';
import { AppInventarioStockFormComponent } from '../app-inventario-stock-form/app-inventario-stock-form.component';

@Component({
  selector: 'app-app-inventario-stock-list',
  standalone: true,
  imports: [CommonModule, AppInventarioStockFormComponent],
  templateUrl: './app-inventario-stock-list.component.html',
  styleUrls: ['./app-inventario-stock-list.component.css']
})
export class AppInventarioStockListComponent implements OnInit, OnDestroy {

  inventarioStocks: InventarioStock[] = [];
  error: string = '';

  private destroy$ = new Subject<void>(); // Para manejar ngOnDestroy y cancelar suscripciones

  @ViewChild(AppInventarioStockFormComponent)
  inventarioStockFormModal!: AppInventarioStockFormComponent;

  constructor(private inventarioStockService: InventarioStockService) {}

  ngOnInit(): void {
    this.cargarInventarioStocks();
  }

  ngOnDestroy(): void {
    // Completa el Subject para cancelar todas las suscripciones
    this.destroy$.next();
    this.destroy$.complete();
  }

  abrirModalNuevo(): void {
    this.inventarioStockFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.inventarioStockFormModal.abrirModal(id);
  }

  cargarInventarioStocks(): void {
    this.inventarioStockService.obtenerInventarioStock()
      .pipe(takeUntil(this.destroy$)) // Cancela la suscripción al destruir el componente
      .subscribe({
        next: (response: InventarioStockResponse) => {
          if (response.success && Array.isArray(response.data)) {
            this.inventarioStocks = response.data;
          } else if (response.success && !response.data) {
            this.inventarioStocks = [];
          } else {
            this.error = response.mensaje || 'Error al obtener la lista de inventario stock.';
            this.inventarioStocks = [];
          }
        },
        error: (err) => {
          this.error = 'Error de conexión con el servidor.';
          console.error('Error HTTP:', err);
        }
      });
  }

  onInventarioStockGuardado(): void {
    this.cargarInventarioStocks();
  }
}
