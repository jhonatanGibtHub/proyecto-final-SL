import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { InventarioStockService } from '../../../../core/services/inventarioStock.service';
import { InventarioStock } from '../../../../core/models/inventarioStock';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';
import { Ubicacion } from '../../../../core/models/ubicacion';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { VacunasService } from '../../../../core/services/vacunas.service';
import { Vacuna } from '../../../../core/models/vacuna';

@Component({
  selector: 'app-app-inventario-stock-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './app-inventario-stock-form.component.html',
  styleUrls: ['./app-inventario-stock-form.component.css']
})
export class AppInventarioStockFormComponent implements OnInit, OnDestroy {

  inventarioStockForm: FormGroup;
  isEditMode: boolean = false;
  inventarioStockId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  vacunas: Vacuna[] = [];
  ubicaciones: Ubicacion[] = [];

  private destroy$ = new Subject<void>(); // Para cancelar suscripciones

  @Output() inventarioStockGuardado = new EventEmitter<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly inventarioStockService: InventarioStockService,
    private readonly vacunasService: VacunasService,
    private readonly ubicacionesService: UbicacionesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.inventarioStockForm = this.fb.group({
      id_vacuna: ['', [Validators.required]],
      id_ubicacion: ['', [Validators.required]],
      cantidad_actual: ['', [Validators.required, Validators.min(0), Validators.maxLength(6), Validators.pattern('^[0-9]+$')]]
    });
  }

  ngOnInit(): void {
    this.cargarVacunas();
    this.cargarUbicaciones();

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.inventarioStockId = +params['id'];
          this.cargarInventarioStock(this.inventarioStockId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
      this.inventarioStockForm.reset({
        id_vacuna: '',
        id_ubicacion: '',
        cantidad_actual: ''
      });
    }
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  onCancel(): void {
    this.cerrarModal();
  }

  cargarVacunas(): void {
    this.vacunasService.obtenerVacunas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.vacunas = response.data;
          }
        },
        error: () => {
          this.error = 'Error al cargar vacunas.';
        }
      });
  }

  cargarUbicaciones(): void {
    this.ubicacionesService.obtenerUbicacione_Clientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

  cargarInventarioStock(id: number): void {
    this.inventarioStockService.obtenerInventarioStockPorId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';
    if (this.inventarioStockForm.invalid) {
      this.inventarioStockForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }

    const inventarioStockData: InventarioStock = this.inventarioStockForm.value;

    if (this.isEditMode && this.inventarioStockId) {
      this.inventarioStockService.actualizarInventarioStock(this.inventarioStockId, inventarioStockData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Inventario stock actualizado correctamente.';
            this.notificationService.success(this.successMessage);
            this.inventarioStockGuardado.emit();
            this.cerrarModal();
          },
          error: (err) => {
            const mensajeError = err.error?.mensaje || 'Error de conexión al actualizar el inventario stock.';
            this.notificationService.error(mensajeError);
          }
        });
    } else {
      this.inventarioStockService.crearInventarioStock(inventarioStockData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Inventario stock creado correctamente.';
            this.notificationService.success(this.successMessage);
            this.inventarioStockGuardado.emit();
            this.cerrarModal();
          },
          error: (err) => {
            const mensajeError = err.error?.mensaje || 'Error de conexión al crear el inventario stock.';
            this.notificationService.error(mensajeError);
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

    switch (fieldName) {
      case 'id_vacuna':
        return field.hasError('required') ? 'Debe seleccionar una vacuna' : '';
      case 'id_ubicacion':
        return field.hasError('required') ? 'Debe seleccionar una ubicación' : '';
      case 'cantidad_actual':
        if (field.hasError('required')) return 'La cantidad es obligatoria';
        if (field.hasError('min')) return 'La cantidad no puede ser negativa';
        if (field.hasError('maxlength')) return 'La cantidad no puede tener más de 6 dígitos';
        if (field.hasError('pattern')) return 'La cantidad solo puede contener números';
        break;
    }
    return '';
  }
}