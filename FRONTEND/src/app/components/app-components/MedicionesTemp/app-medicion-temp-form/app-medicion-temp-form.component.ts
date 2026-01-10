import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MedicionesTempService } from '../../../../core/services/medicionesTemp.service';
import { MedicionTemp } from '../../../../core/models/medicionTemp';
import { SensoresTempService } from '../../../../core/services/sensoresTemp.service';
import { LotesService } from '../../../../core/services/lotes.service';
import { SensorTemp } from '../../../../core/models/sensorTemp';
import { Lote } from '../../../../core/models/lote';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-app-medicion-temp-form',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  templateUrl: './app-medicion-temp-form.component.html',
  styleUrls: ['./app-medicion-temp-form.component.css']
})
export class AppMedicionTempFormComponent implements OnInit, OnDestroy {

  medicionForm: FormGroup;
  isEditMode: boolean = false;
  medicionId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  sensores: SensorTemp[] = [];
  lotes: Lote[] = [];

  @Output() medicionGuardada = new EventEmitter<void>();

  // Arreglo para almacenar todas las suscripciones
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly medicionService: MedicionesTempService,
    private readonly sensoresService: SensoresTempService,
    private readonly lotesService: LotesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.medicionForm = this.fb.group({
      id_sensor: ['', [Validators.required]],
      id_lote: ['', [Validators.required]],
      temperatura_c: ['', [Validators.required, Validators.min(-100), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.cargarSensores();
    this.cargarLotes();
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  abrirModal(medicionId?: number): void {
    this.showModal = true;
    this.error = '';
    this.successMessage = '';
    this.cargarLotes();
    if (medicionId) {
      this.isEditMode = true;
      this.medicionId = medicionId;
      this.cargarMedicion(medicionId);
    } else {
      this.isEditMode = false;
      this.medicionId = null;
      this.medicionForm.reset({
        id_sensor: '',
        id_lote: '',
        temperatura_c: ''
      });
    }
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  onCancel(): void {
    this.cerrarModal();
  }

  cargarSensores(): void {
    const sub = this.sensoresService.obtenerSensores().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.sensores = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar sensores:', err);
      }
    });
    this.subscriptions.push(sub);
  }

  cargarLotes(): void {
    const sub = this.lotesService.obtenerLotes_Medicion().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.lotes = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar lotes:', err);
      }
    });
    this.subscriptions.push(sub);
  }

  cargarMedicion(id: number): void {
    const sub = this.medicionService.obtenerMedicionPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          this.medicionForm.patchValue(response.data);
          this.cdr.detectChanges();
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar la medición: fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
      }
    });
    this.subscriptions.push(sub);
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';

    if (this.medicionForm.invalid) {
      this.medicionForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }

    const medicionData: MedicionTemp = this.medicionForm.value;

    if (this.isEditMode && this.medicionId) {
      const sub = this.medicionService.actualizarMedicion(this.medicionId, medicionData).subscribe({
        next: () => {
          this.successMessage = 'Medición actualizada correctamente.';
          this.notificationService.success(this.successMessage);
          this.medicionGuardada.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al actualizar la medición.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
      this.subscriptions.push(sub);
    } else {
      const sub = this.medicionService.crearMedicion(medicionData).subscribe({
        next: () => {
          this.successMessage = 'Medición creada correctamente.';
          this.notificationService.success(this.successMessage);
          this.medicionGuardada.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al crear la medición.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
      this.subscriptions.push(sub);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.medicionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.medicionForm.get(fieldName);
    if (!field) return '';

    switch (fieldName) {
      case 'id_sensor':
        if (field.hasError('required')) return 'Debe seleccionar un sensor';
        break;
      case 'id_lote':
        if (field.hasError('required')) return 'Debe seleccionar un lote';
        break;
      case 'temperatura_c':
        if (field.hasError('required')) return 'La temperatura es obligatoria';
        if (field.hasError('min') || field.hasError('max')) return 'La temperatura debe estar entre -100 y 100 °C';
        break;
    }
    return '';
  }
}