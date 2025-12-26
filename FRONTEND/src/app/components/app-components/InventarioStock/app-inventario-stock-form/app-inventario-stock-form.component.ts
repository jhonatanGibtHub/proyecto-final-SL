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
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-app-inventario-stock-form',
  imports: [CommonModule, ReactiveFormsModule,MatFormFieldModule,
    MatSelectModule],
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
    private readonly fb: FormBuilder,
    private readonly inventarioStockService: InventarioStockService,
    private readonly lotesService: LotesService,
    private readonly ubicacionesService: UbicacionesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.inventarioStockForm = this.fb.group({
      id_lote: ['', [Validators.required]],
      id_ubicacion: ['', [Validators.required]],
      cantidad_actual: ['', [Validators.required, Validators.min(0.01)]]
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
      this.inventarioStockForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }
    const inventarioStockData: InventarioStock = this.inventarioStockForm.value;
    console.log('Datos enviados:', inventarioStockData);
    if (this.isEditMode && this.inventarioStockId) {
      this.inventarioStockService.actualizarInventarioStock(this.inventarioStockId, inventarioStockData).subscribe({
        next: (response) => {
            this.successMessage = 'Inventario stock actualizado correctamente.';
            this.notificationService.success(this.successMessage);
            this.inventarioStockGuardado.emit();
            this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al actualizar el inventario stock.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    } else {
      this.inventarioStockService.crearInventarioStock(inventarioStockData).subscribe({
        next: (response) => {
            this.successMessage = 'Inventario stock creado correctamente.';
            this.notificationService.success(this.successMessage);
            this.inventarioStockGuardado.emit();
            this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al crear el inventario stock.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.inventarioStockForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.inventarioStockForm.get(fieldName);

    if (!field) return '';

    if (field.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (field.hasError('min')) {
      const min = field.errors?.['min']?.min;
      return `El valor mínimo permitido es ${min}`;
    }

    return '';
  }
}