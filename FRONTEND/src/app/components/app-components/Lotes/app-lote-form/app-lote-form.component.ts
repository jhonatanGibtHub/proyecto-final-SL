import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LotesService } from '../../../../core/services/lotes.service';
import { Lote } from '../../../../core/models/lote';
import { VacunasService } from '../../../../core/services/vacunas.service';
import { Vacuna } from '../../../../core/models/vacuna';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';

@Component({
  selector: 'app-app-lote-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app-lote-form.component.html',
  styleUrl: './app-lote-form.component.css'
})
export class AppLoteFormComponent implements OnInit {

  loteForm: FormGroup;
  isEditMode: boolean = false;
  loteId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  vacunas: Vacuna[] = [];

  @Output() loteGuardado = new EventEmitter<void>();

  abrirModal(loteId?: number): void {
    this.showModal = true;
    this.error = '';
    this.successMessage = '';

    if (loteId) {
      this.isEditMode = true;
      this.loteId = loteId;
      this.cargarLote(loteId);
    } else {
      this.isEditMode = false;
      this.loteId = null;
      this.loteForm.reset();
    }
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly loteService: LotesService,
    private readonly vacunasService: VacunasService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.loteForm = this.fb.group({
      id_vacuna: ['', [Validators.required]],
      fecha_fabricacion: ['', [Validators.required]],
      fecha_caducidad: ['', [Validators.required]],
      cantidad_inicial_unidades: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarVacunas();
  }

  cargarVacunas() {
    this.vacunasService.obtenerVacunas().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.vacunas = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar vacunas:', err);
      }
    });
  }

  cargarLote(id: number) {
    this.loteService.obtenerLotePorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const lote = response.data as Lote;
          this.loteForm.patchValue(lote);
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar el lote: Fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
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
    if (this.loteForm.invalid) {
      this.loteForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }
    const loteData: Lote = this.loteForm.value;
    if (this.isEditMode && this.loteId) {
      this.loteService.actualizarLote(this.loteId, loteData).subscribe({
        next: (response) => {
          this.successMessage = 'Lote actualizado correctamente.';
          this.notificationService.success(this.successMessage);
          this.loteGuardado.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al actualizar el lote.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    } else {
      this.loteService.crearLote(loteData).subscribe({
        next: (response) => {
            this.successMessage = 'Lote creado correctamente.';
            this.notificationService.success(this.successMessage);
            this.loteGuardado.emit();
            this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al crear el lote.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loteForm.get(fieldName);

    if (!field) return '';

    if (field.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (field.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }

    if (field.hasError('min')) {
      const min = field.errors?.['min']?.min;
      return `El valor mínimo permitido es ${min}`;
    }

    return '';
  }
}