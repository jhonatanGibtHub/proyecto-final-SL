import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';
import { Ubicacion } from '../../../../core/models/ubicacion';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-app-ubicacion-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './app-ubicacion-form.component.html',
  styleUrl: './app-ubicacion-form.component.css'
})
export class AppUbicacionFormComponent implements OnInit, OnDestroy {

  ubicacionForm: FormGroup;
  isEditMode: boolean = false;
  ubicacionId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  tipos = [
    'Distribuidor',
    'Centro de Salud',
    'Hospital General',
    'Clínica Privada',
    'Farmacia Comunitaria',
    'Laboratorio Clínico',
    'Unidad de Emergencias',
    'Centro de Especialidades Médicas',
    'Banco de Sangre',
    'Hospital Pediátrico',
    'Centro de Rehabilitación',
    'Consultorio Médico Rural'
  ];

  @Output() ubicacionGuardado = new EventEmitter<void>();

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly ubicacionService: UbicacionesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.ubicacionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['', [Validators.required]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ubicacionTexto: ['', Validators.required] // ciudad / distrito / provincia
    });
  }

  ngOnInit(): void {
    // Suscripción a los parámetros de la ruta
    const routeSub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.ubicacionId = +params['id'];
        this.cargarUbicacion(this.ubicacionId);
      }
    });
    this.subscriptions.push(routeSub);
  }

  abrirModal(ubicacionId?: number): void {
    this.showModal = true;
    this.error = '';
    this.successMessage = '';

    if (ubicacionId) {
      this.isEditMode = true;
      this.ubicacionId = ubicacionId;
      this.cargarUbicacion(ubicacionId);
    } else {
      this.isEditMode = false;
      this.ubicacionId = null;
      this.ubicacionForm.reset({
        nombre: '',
        tipo: '',
        direccion: '',
        ubicacionTexto: ''
      });
    }
  }

  cargarUbicacion(id: number) {
    const sub = this.ubicacionService.obtenerUbicacionPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const ubicacion: Ubicacion = response.data;
          const formValue = {
            ...ubicacion,
            ubicacionTexto: ubicacion.ciudad || '' // transforma ciudad a campo form
          };
          this.ubicacionForm.patchValue(formValue);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar la ubicación: Fallo de conexión.';
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

  onSubmit() {
    this.error = '';
    this.successMessage = '';

    if (this.ubicacionForm.invalid) {
      this.ubicacionForm.markAllAsTouched();
      this.error = 'Por favor, seleccione y complete todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }

    const ubicacionData: Ubicacion = this.ubicacionForm.value;

    let saveSub: Subscription;
    if (this.isEditMode && this.ubicacionId) {
      saveSub = this.ubicacionService.actualizarUbicacion(this.ubicacionId, ubicacionData).subscribe({
        next: (response) => {
          this.successMessage = 'Ubicación actualizada correctamente.';
          this.notificationService.success(this.successMessage);
          this.ubicacionGuardado.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = err.error?.mensaje || 'Error de conexión al actualizar la ubicación.';
          this.notificationService.error(this.error);
        }
      });
    } else {
      saveSub = this.ubicacionService.crearUbicacion(ubicacionData).subscribe({
        next: (response) => {
          this.successMessage = 'Ubicación creada correctamente.';
          this.notificationService.success(this.successMessage);
          this.ubicacionGuardado.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = err.error?.mensaje || 'Error al crear la ubicación.';
          this.notificationService.error(this.error);
        }
      });
    }
    this.subscriptions.push(saveSub);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ubicacionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.ubicacionForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }

    return '';
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones al destruir el componente
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}