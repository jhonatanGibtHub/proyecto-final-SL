import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventarioStockService } from '../../../../core/services/inventarioStock.service';
import { InventarioStock } from '../../../../core/models/inventarioStock';
import { LotesService } from '../../../../core/services/lotes.service';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';
import { Lote } from '../../../../core/models/lote';
import { Ubicacion } from '../../../../core/models/ubicacion';

@Component({
  selector: 'app-app-inventario-stock-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app-inventario-stock-form.component.html',
  styleUrl: './app-inventario-stock-form.component.css'
})
export class AppInventarioStockFormComponent implements OnInit {

  inventarioStockForm: FormGroup;
  isEditMode: boolean = false;
  inventarioStockId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  lotes: Lote[] = [];
  ubicaciones: Ubicacion[] = [];

  @Output() inventarioStockGuardado = new EventEmitter<void>();

  abrirModal(inventarioStockId?: number): void {
    this.showModal = true;
    this.error = '';
    this.successMessage = '';

    if (inventarioStockId) {
      this.isEditMode = true;
      this.inventarioStockId = inventarioStockId;
      this.cargarInventarioStock(inventarioStockId);
    } else {
      this.isEditMode = false;
      this.inventarioStockId = null;
      this.inventarioStockForm.reset();
    }
  }

  constructor(
    private fb: FormBuilder,
    private inventarioStockService: InventarioStockService,
    private lotesService: LotesService,
    private ubicacionesService: UbicacionesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.inventarioStockForm = this.fb.group({
      id_lote: ['', [Validators.required]],
      id_ubicacion: ['', [Validators.required]],
      cantidad_actual: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cargarLotes();
    this.cargarUbicaciones();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.inventarioStockId = +params['id'];
        this.cargarInventarioStock(this.inventarioStockId);
      }
    });
  }

  cargarLotes() {
    this.lotesService.obtenerLotes().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.lotes = response.data;
        }
      },
      error: () => {
        this.error = 'Error al cargar lotes.';
      }
    });
  }

  cargarUbicaciones() {
    this.ubicacionesService.obtenerUbicaciones().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.ubicaciones = response.data;
        }
      },
      error: () => {
        this.error = 'Error al cargar ubicaciones.';
      }
    });
  }

  cargarInventarioStock(id: number) {
    this.inventarioStockService.obtenerInventarioStockPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const inventarioStock = response.data as InventarioStock;
          this.inventarioStockForm.patchValue(inventarioStock);
        } else if (response.error) {
          this.error = response.error;
        }
      },
      error: () => {
        this.error = 'Error al cargar el inventario stock.';
      }
    });
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  onCancel(): void {
    this.cerrarModal();
  }

  onSubmit() {
    this.error = '';
    this.successMessage = '';
    if (this.inventarioStockForm.invalid) {
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      return;
    }
    const inventarioStockData: InventarioStock = this.inventarioStockForm.value;
    console.log('Datos enviados:', inventarioStockData);
    if (this.isEditMode && this.inventarioStockId) {
      this.inventarioStockService.actualizarInventarioStock(this.inventarioStockId, inventarioStockData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Inventario stock actualizado correctamente.';
            this.inventarioStockGuardado.emit();
            this.cerrarModal();
          } else {
            this.error = response.mensaje || 'Error al actualizar el inventario stock.';
          }
        },
        error: () => {
          this.error = 'Error de conexión al actualizar el inventario stock.';
        }
      });
    } else {
      this.inventarioStockService.crearInventarioStock(inventarioStockData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Inventario stock creado correctamente.';
            this.inventarioStockGuardado.emit();
            this.cerrarModal();
          } else {
            this.error = response.mensaje || 'Error al crear el inventario stock.';
          }
        },
        error: () => {
          this.error = 'Error de conexión al crear el inventario stock.';
        }
      });
    }
  }
}