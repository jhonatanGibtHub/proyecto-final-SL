import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SensoresTempService } from '../../../../core/services/sensoresTemp.service';
import { SensorTemp } from '../../../../core/models/sensorTemp';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';
import { Ubicacion } from '../../../../core/models/ubicacion';

@Component({
  selector: 'app-app-sensor-temp-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app-sensor-temp-form.component.html',
  styleUrl: './app-sensor-temp-form.component.css'
})
export class AppSensorTempFormComponent implements OnInit {

  sensorTempForm: FormGroup;
  isEditMode: boolean = false;
  sensorId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  ubicaciones: Ubicacion[] = [];

  @Output() sensorTempGuardado = new EventEmitter<void>();

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
      this.sensorTempForm.reset();
    }
  }

  constructor(
    private fb: FormBuilder,
    private sensoresTempService: SensoresTempService,
    private ubicacionesService: UbicacionesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.sensorTempForm = this.fb.group({
      codigo_serie: ['', [Validators.required]],
      id_ubicacion_actual: ['', [Validators.required]],
      ultima_calibracion: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarUbicaciones();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.sensorId = +params['id'];
        this.cargarSensor(this.sensorId);
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

  cargarSensor(id: number) {
    this.sensoresTempService.obtenerSensorPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const sensor = response.data as SensorTemp;
          this.sensorTempForm.patchValue(sensor);
        } else if (response.error) {
          this.error = response.error;
        }
      },
      error: () => {
        this.error = 'Error al cargar el sensor.';
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
    if (this.sensorTempForm.invalid) {
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      return;
    }
    const sensorData: SensorTemp = this.sensorTempForm.value;
    console.log('Datos enviados:', sensorData);
    if (this.isEditMode && this.sensorId) {
      this.sensoresTempService.actualizarSensor(this.sensorId, sensorData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Sensor actualizado correctamente.';
            this.sensorTempGuardado.emit();
            this.cerrarModal();
          } else {
            this.error = response.mensaje || 'Error al actualizar el sensor.';
          }
        },
        error: () => {
          this.error = 'Error de conexión al actualizar el sensor.';
        }
      });
    } else {
      this.sensoresTempService.crearSensor(sensorData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Sensor creado correctamente.';
            this.sensorTempGuardado.emit();
            this.cerrarModal();
          } else {
            this.error = response.mensaje || 'Error al crear el sensor.';
          }
        },
        error: () => {
          this.error = 'Error de conexión al crear el sensor.';
        }
      });
    }
  }
}