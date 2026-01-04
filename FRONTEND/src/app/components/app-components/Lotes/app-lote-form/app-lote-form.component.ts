import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LotesService } from '../../../../core/services/lotes.service';
import { VacunasService } from '../../../../core/services/vacunas.service';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { Lote } from '../../../../core/models/lote';
import { Vacuna } from '../../../../core/models/vacuna';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-app-lote-form',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatInputModule
  ],
  templateUrl: './app-lote-form.component.html',
  styleUrls: ['./app-lote-form.component.css']
})
export class AppLoteFormComponent implements OnInit, OnDestroy {

  loteForm: FormGroup;
  isEditMode: boolean = false;
  loteId: number | null = null;

  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  vacunas: Vacuna[] = [];

  @Output() loteGuardado = new EventEmitter<void>();

  // Arreglo para manejar todas las suscripciones
  private subscriptions: Subscription[] = [];

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
      cantidad_inicial_unidades: ['', [
        Validators.required,
        Validators.min(1),
        Validators.maxLength(6),
        Validators.pattern('^[0-9]+$')
      ]]
    });
  }

  ngOnInit(): void {
    this.cargarVacunas();

    const sub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.loteId = +params['id'];
        this.cargarLote(this.loteId);
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

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
      this.loteForm.reset({
        id_vacuna: '',
        fecha_fabricacion: '',
        fecha_caducidad: '',
        cantidad_inicial_unidades: ''
      });
    }
  }

  private formatDateForMySQL(date: Date): string {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  cargarVacunas(): void {
    const sub = this.vacunasService.obtenerVacunas().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.vacunas = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar vacunas:', err);
      }
    });
    this.subscriptions.push(sub);
  }

  cargarLote(id: number): void {
    const sub = this.loteService.obtenerLotePorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          this.loteForm.patchValue(response.data as Lote);
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar el lote: fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
      }
    });
    this.subscriptions.push(sub);
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  onCancel(): void {
    this.cerrarModal();
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';

    if (this.loteForm.invalid) {
      this.loteForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }

    const formValue = this.loteForm.value;
    const loteData: Lote = {
      ...formValue,
      fecha_fabricacion: this.formatDateForMySQL(formValue.fecha_fabricacion),
      fecha_caducidad: this.formatDateForMySQL(formValue.fecha_caducidad)
    };

    let sub;
    if (this.isEditMode && this.loteId) {
      sub = this.loteService.actualizarLote(this.loteId, loteData).subscribe({
        next: () => {
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
      sub = this.loteService.crearLote(loteData).subscribe({
        next: () => {
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

    this.subscriptions.push(sub);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loteForm.get(fieldName);
    if (!field) return '';

    switch (fieldName) {
      case 'id_vacuna':
        if (field.hasError('required')) return 'Debe seleccionar una vacuna';
        break;
      case 'fecha_fabricacion':
        if (field.hasError('required')) return 'La fecha de fabricación es obligatoria';
        break;
      case 'fecha_caducidad':
        if (field.hasError('required')) return 'La fecha de caducidad es obligatoria';
        break;
      case 'cantidad_inicial_unidades':
        if (field.hasError('required')) return 'La cantidad inicial es obligatoria';
        if (field.hasError('min')) return 'La cantidad debe ser mayor a 0';
        if (field.hasError('maxlength')) return 'Máximo 6 dígitos permitidos';
        if (field.hasError('pattern')) return 'Solo se permiten números';
        break;
    }

    return '';
  }
}