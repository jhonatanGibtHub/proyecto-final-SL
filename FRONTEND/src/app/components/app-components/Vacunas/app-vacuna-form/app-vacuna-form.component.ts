import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { VacunasService } from '../../../../core/services/vacunas.service';
import { Vacuna } from '../../../../core/models/vacuna';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';

@Component({
  selector: 'app-app-vacuna-form',
  imports: [CommonModule, ReactiveFormsModule, NgxSliderModule],
  templateUrl: './app-vacuna-form.component.html',
  styleUrls: ['./app-vacuna-form.component.css']
})
export class AppVacunaFormComponent implements OnInit, OnDestroy {

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
    step: 1
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly vacunaService: VacunasService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.vacunaForm = this.fb.group({
      nombre_comercial: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      fabricante: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      temp_min_c: [this.minValue, [Validators.required, Validators.min(-100), Validators.max(100)]],
      temp_max_c: [this.maxValue, [Validators.required, Validators.min(-100), Validators.max(100)]],
    });
  }

  ngOnInit(): void {
    const routeSub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.vacunaId = +params['id'];
        this.cargarVacuna(this.vacunaId);
      }
    });

    this.subscriptions.push(routeSub);
  }

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
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.minValue = -50;
    this.maxValue = 50;
    this.options = { ...this.options, floor: -99, ceil: 99 };
    this.vacunaForm.reset({
      temp_min_c: this.minValue,
      temp_max_c: this.maxValue
    });
  }

  cargarVacuna(id: number): void {
    const sub = this.vacunaService.obtenerVacunaPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const vacuna = response.data;
          this.minValue = Math.max(this.options.floor!, vacuna.temp_min_c);
          this.maxValue = Math.min(this.options.ceil!, vacuna.temp_max_c);

          if (this.minValue >= this.maxValue) {
            this.maxValue = Math.min(this.options.ceil!, this.minValue + 1);
            if (this.maxValue > this.options.ceil!) {
              this.maxValue = this.options.ceil!;
              this.minValue = this.maxValue - 1;
            }
          }

          this.vacunaForm.patchValue({
            ...vacuna,
            temp_min_c: this.minValue,
            temp_max_c: this.maxValue
          });

        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar la vacuna: Fallo de conexión.';
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

  onMinChange(value: number): void {
    this.minValue = value;
    if (this.minValue >= this.maxValue) {
      this.maxValue = Math.min(this.options.ceil!, this.minValue + 1);
    }
    this.vacunaForm.patchValue({ temp_min_c: this.minValue, temp_max_c: this.maxValue });
  }

  onMaxChange(value: number): void {
    this.maxValue = value;
    if (this.maxValue <= this.minValue) {
      this.minValue = Math.max(this.options.floor!, this.maxValue - 1);
    }
    this.vacunaForm.patchValue({ temp_min_c: this.minValue, temp_max_c: this.maxValue });
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';
    this.vacunaForm.patchValue({ temp_min_c: this.minValue, temp_max_c: this.maxValue });

    if (this.vacunaForm.invalid) {
      this.vacunaForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }

    const vacunaData: Vacuna = this.vacunaForm.value;

    const sub = this.isEditMode && this.vacunaId
      ? this.vacunaService.actualizarVacuna(this.vacunaId, vacunaData)
      : this.vacunaService.crearVacuna(vacunaData);

    const actionSub = sub.subscribe({
      next: () => {
        this.successMessage = this.isEditMode ? 'Vacuna actualizada correctamente.' : 'Vacuna creada correctamente.';
        this.notificationService.success(this.successMessage);
        this.vacunaGuardado.emit();
        this.cerrarModal();
      },
      error: (err) => {
        this.error = this.isEditMode ? 'Error de conexión al actualizar la vacuna.' : 'Error de conexión al crear la vacuna.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
      }
    });

    this.subscriptions.push(actionSub);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.vacunaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.vacunaForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) return 'Este campo es obligatorio';
    if (field.hasError('minlength')) return `Mínimo ${field.errors?.['minlength']?.requiredLength} caracteres`;
    if (field.hasError('maxlength')) return `Máximo ${field.errors?.['maxlength']?.requiredLength} caracteres`;
    if (field.hasError('min')) return `El valor mínimo permitido es ${field.errors?.['min']?.min}°C`;
    if (field.hasError('max')) return `El valor máximo permitido es ${field.errors?.['max']?.max}°C`;

    return '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}