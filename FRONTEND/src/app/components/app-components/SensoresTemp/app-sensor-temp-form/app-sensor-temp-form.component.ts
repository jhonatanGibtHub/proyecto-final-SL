import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SensoresTempService } from '../../../../core/services/sensoresTemp.service';
import { SensorTemp } from '../../../../core/models/sensorTemp';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';
import { Ubicacion } from '../../../../core/models/ubicacion';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-app-sensor-temp-form',
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule
  ],
  templateUrl: './app-sensor-temp-form.component.html',
  styleUrl: './app-sensor-temp-form.component.css'
})
export class AppSensorTempFormComponent implements OnInit, OnDestroy {

  sensorTempForm: FormGroup;
  isEditMode: boolean = false;
  sensorId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  ubicaciones: Ubicacion[] = [];

  @Output() sensorTempGuardado = new EventEmitter<void>();

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly sensoresTempService: SensoresTempService,
    private readonly ubicacionesService: UbicacionesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.sensorTempForm = this.fb.group({
      codigo_serie: ['', [Validators.required]],
      id_ubicacion_actual: ['', [Validators.required]],
      ultima_calibracion: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarUbicaciones();

    const routeSub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.sensorId = +params['id'];
        this.cargarSensor(this.sensorId);
      }
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  abrirModal(sensorId?: number): void {
    this.showModal = true;
    this.error = '';
    this.successMessage = '';

    if (sensorId) {
      this.isEditMode = true;
      this.sensorId = sensorId;
      this.cargarSensor(sensorId);
    } else {
      this.isEditMode = false;
      this.sensorId = null;
      this.sensorTempForm.reset({
        codigo_serie: '',
        id_ubicacion_actual: '',
        ultima_calibracion: ''
      });
    }
  }

  cargarUbicaciones(): void {
    const sub = this.ubicacionesService.obtenerUbicaciones().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.ubicaciones = response.data;
        }
      },
      error: () => {
        this.error = 'Error al cargar ubicaciones.';
      }
    });
    this.subscriptions.push(sub);
  }

  cargarSensor(id: number): void {
    const sub = this.sensoresTempService.obtenerSensorPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          this.sensorTempForm.patchValue(response.data);
        } else if (response.error) {
          this.error = response.error;
        }
      },
      error: () => {
        this.error = 'Error al cargar el sensor.';
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

    if (this.sensorTempForm.invalid) {
      this.sensorTempForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }

    const sensorData: SensorTemp = this.sensorTempForm.value;

    let sub;
    if (this.isEditMode && this.sensorId) {
      sub = this.sensoresTempService.actualizarSensor(this.sensorId, sensorData).subscribe({
        next: () => {
          this.successMessage = 'Sensor actualizado correctamente.';
          this.notificationService.success(this.successMessage);
          this.sensorTempGuardado.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al actualizar el sensor.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    } else {
      sub = this.sensoresTempService.crearSensor(sensorData).subscribe({
        next: () => {
          this.successMessage = 'Sensor creado correctamente.';
          this.notificationService.success(this.successMessage);
          this.sensorTempGuardado.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al crear el sensor.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    }

    this.subscriptions.push(sub);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.sensorTempForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.sensorTempForm.get(fieldName);
    if (!field) return '';

    switch (fieldName) {
      case 'codigo_serie':
        return field.hasError('required') ? 'El código de serie es obligatorio' : '';
      case 'id_ubicacion_actual':
        return field.hasError('required') ? 'Debe seleccionar una ubicación' : '';
      case 'ultima_calibracion':
        return field.hasError('required') ? 'La fecha de última calibración es obligatoria' : '';
      default:
        return '';
    }
  }
}