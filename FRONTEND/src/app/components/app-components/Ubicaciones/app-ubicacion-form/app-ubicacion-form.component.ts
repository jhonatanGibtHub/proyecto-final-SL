import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';
import { Ubicacion } from '../../../../core/models/ubicacion';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UbigeoService } from '../../../../core/services/ubigeo.service';

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
export class AppUbicacionFormComponent implements OnInit {

  ubicacionForm: FormGroup;
  isEditMode: boolean = false;
  ubicacionId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  tipos = ['Almacén Central', 'Distribuidor', 'Centro de Salud'];

  @Output() ubicacionGuardado = new EventEmitter<void>();

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
      //distrito: ['', [Validators.required]],
      //provincia: ['', [Validators.required]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ubicacionTexto: ['', Validators.required] // ciudad / distrito / provincia
    });
  }

  cargarUbicacion(id: number) {
    this.ubicacionService.obtenerUbicacionPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const ubicacion = response.data;
          this.ubicacionForm.patchValue(ubicacion);

          this.ubicacionForm.patchValue({

            nombre: ubicacion.nombre,
            tipo: ubicacion.tipo,
            direccion: ubicacion.direccion,
            ubicacionTexto: ubicacion.ciudad,

          });

        }
      },
      error: (err) => {
        this.error = 'Error al cargar la ubicación: Fallo de conexión.';
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
        this.ubicacionId = +params['id'];
        this.cargarUbicacion(this.ubicacionId);
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

    if (this.ubicacionForm.invalid) {
      this.ubicacionForm.markAllAsTouched();
      this.error = 'Por favor, seleccione y complete todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }

    const ubicacionData: Ubicacion = this.ubicacionForm.value;


    if (this.isEditMode && this.ubicacionId) {
      this.ubicacionService.actualizarUbicacion(this.ubicacionId, ubicacionData).subscribe({
        next: (response) => {
          this.successMessage = 'Ubicación actualizada correctamente.';
          this.notificationService.success(this.successMessage);
          this.ubicacionGuardado.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al actualizar la ubicación.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    } else {
      this.ubicacionService.crearUbicacion(ubicacionData).subscribe({
        next: (response) => {
          this.successMessage = 'Ubicación creada correctamente.';
          this.notificationService.success(this.successMessage);
          this.ubicacionGuardado.emit();
          this.cerrarModal();
        },
        error: (err) => {

          const mensajeError = err.error?.mensaje || 'Error al crear la ubicación.';
          this.notificationService.error(mensajeError || this.error);
        }
      });
    }
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
}