import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioStock, InventarioStockResponse } from '../../../../core/models/inventarioStock';
import { InventarioStockService } from '../../../../core/services/inventarioStock.service';
import { AppInventarioStockFormComponent } from '../app-inventario-stock-form/app-inventario-stock-form.component';

@Component({
  selector: 'app-app-inventario-stock-list',
  imports: [CommonModule, AppInventarioStockFormComponent],
  templateUrl: './app-inventario-stock-list.component.html',
  styleUrl: './app-inventario-stock-list.component.css'
})
export class AppInventarioStockListComponent implements OnInit {
  inventarioStocks: InventarioStock[] = [];
  error: string = '';

  @ViewChild(AppInventarioStockFormComponent) inventarioStockFormModal!: AppInventarioStockFormComponent;

  abrirModalNuevo(): void {
    this.inventarioStockFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.inventarioStockFormModal.abrirModal(id);
  }

  constructor(private inventarioStockService: InventarioStockService) {}

  ngOnInit(): void {
    this.cargarInventarioStocks();
  }

  cargarInventarioStocks() {
    this.inventarioStockService.obtenerInventarioStock().subscribe({
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

  onInventarioStockGuardado() {
    this.cargarInventarioStocks();
  }
}