import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VacunasService } from '../../../../core/services/vacunas.service';
import { Vacuna } from '../../../../core/models/vacuna';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';

@Component({
  selector: 'app-app-vacuna-form',
  imports: [CommonModule, ReactiveFormsModule, NgxSliderModule],
  templateUrl: './app-vacuna-form.component.html',
  styleUrl: './app-vacuna-form.component.css'
})
export class AppVacunaFormComponent implements OnInit {

  vacunaForm: FormGroup;
  isEditMode: boolean = false;
  vacunaId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  @Output() vacunaGuardado = new EventEmitter<void>();
  minValue: number = -50;
  maxValue: number = 50;
  options: Options = {
    floor: -99,
    ceil: 99,
  };

  abrirModal(vacunaId?: number): void {
    this.showModal = true;
    this.error = '';
    this.successMessage = '';

    if (vacunaId) {
      this.isEditMode = true;
      this.vacunaId = vacunaId;
      this.cargarVacuna(vacunaId);
    } else {
      this.isEditMode = false;
      this.vacunaId = null;
      this.minValue = -50;
      this.maxValue = 50;
      this.vacunaForm.reset();
      this.vacunaForm.patchValue({
        temp_min_c: this.minValue,
        temp_max_c: this.maxValue
      });
    }
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly vacunaService: VacunasService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.vacunaForm = this.fb.group(
      {
        nombre_comercial: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50)
          ]
        ],
        fabricante: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50)
          ]
        ],
        temp_min_c: [
          this.minValue,
          [
            Validators.required,
            Validators.min(-100),
            Validators.max(100)
          ]
        ],
        temp_max_c: [
          this.maxValue,
          [
            Validators.required,
            Validators.min(-100),
            Validators.max(100)
          ]
        ],
      }
    );
  }

  cargarVacuna(id: number) {
    this.vacunaService.obtenerVacunaPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const vacuna = response.data;
          this.vacunaForm.patchValue(vacuna);
          this.minValue = vacuna.temp_min_c;
          this.maxValue = vacuna.temp_max_c;
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar la vacuna: Fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(
          mensajeError || this.error
        );
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.vacunaId = +params['id'];
        this.cargarVacuna(this.vacunaId);
      }
    });
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  onCancel(): void {
    this.cerrarModal();
  }

  onMinChange(value: number) {
    this.minValue = value;
    this.vacunaForm.get('temp_min_c')?.setValue(value);
    if (this.minValue >= this.maxValue) {
      this.maxValue = this.minValue + 1;
      this.vacunaForm.get('temp_max_c')?.setValue(this.maxValue);
    }
  }

  onMaxChange(value: number) {
    this.maxValue = value;
    this.vacunaForm.get('temp_max_c')?.setValue(value);
    if (this.maxValue <= this.minValue) {
      this.minValue = this.maxValue - 1;
      this.vacunaForm.get('temp_min_c')?.setValue(this.minValue);
    }
  }

  onSubmit() {
    this.error = '';
    this.successMessage = '';
    this.vacunaForm.patchValue({
      temp_min_c: this.minValue,
      temp_max_c: this.maxValue
    });
    if (this.vacunaForm.invalid) {
      this.vacunaForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }
    const vacunaData: Vacuna = this.vacunaForm.value;
    if (this.isEditMode && this.vacunaId) {
      this.vacunaService.actualizarVacuna(this.vacunaId, vacunaData).subscribe({
        next: (response) => {
          this.successMessage = 'Vacuna actualizada correctamente.';
          this.notificationService.info(this.successMessage);
          this.vacunaGuardado.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al actualizar la vacuna.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(
            mensajeError || this.error
          );
        }
      });
    } else {
      this.vacunaService.crearVacuna(vacunaData).subscribe({
        next: (response) => {
            this.successMessage = 'Vacuna creada correctamente.';
            this.notificationService.success(this.successMessage);
            this.vacunaGuardado.emit();
            this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al crear la vacuna.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(
            mensajeError || this.error
          );
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.vacunaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.vacunaForm.get(fieldName);

    if (!field) return '';

    if (field.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (field.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }

    if (field.hasError('maxlength')) {
      const requiredLength = field.errors?.['maxlength']?.requiredLength;
      return `Máximo ${requiredLength} caracteres`;
    }

    if (field.hasError('min')) {
      const min = field.errors?.['min']?.min;
      return `El valor mínimo permitido es ${min}°C`;
    }

    if (field.hasError('max')) {
      const max = field.errors?.['max']?.max;
      return `El valor máximo permitido es ${max}°C`;
    }

    // Error a nivel de formulario
    if (
      this.vacunaForm.hasError('tempRangeInvalid') &&
      (fieldName === 'temp_min_c' || fieldName === 'temp_max_c')
    ) {
      return 'La temperatura mínima debe ser menor que la máxima';
    }

    return '';
  }

}
