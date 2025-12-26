import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransportistasService } from '../../../../core/services/transportistas.service';
import { Transportista } from '../../../../core/models/transportista';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-app-transportista-form',
  imports: [CommonModule, ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule],
  templateUrl: './app-transportista-form.component.html',
  styleUrl: './app-transportista-form.component.css'
})
export class AppTransportistaFormComponent implements OnInit {

  transportistaForm: FormGroup;
  isEditMode: boolean = false;
  transportistaId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  tiposVehiculo = ['Camión Refrigerado', 'Avión', 'Furgoneta'];

  @Output() transportistaGuardado = new EventEmitter<void>();

  abrirModal(transportistaId?: number): void {
    this.showModal = true;
    this.error = '';
    this.successMessage = '';

    if (transportistaId) {
      this.isEditMode = true;
      this.transportistaId = transportistaId;
      this.cargarTransportista(transportistaId);
    } else {
      this.isEditMode = false;
      this.transportistaId = null;
      this.transportistaForm.reset({
        nombre: '',
        licencia: '',
        telefono: '',
        tipo_vehiculo: ''
      });
    }
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly transportistaService: TransportistasService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.transportistaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      licencia: ['', [Validators.required]],
      telefono: ['', [Validators.required,  Validators.minLength(9), Validators.maxLength(9)]],
      tipo_vehiculo: ['', [Validators.required]]
    });
  }

  cargarTransportista(id: number) {
    this.transportistaService.obtenerTransportistaPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const transportista = response.data as Transportista;
          this.transportistaForm.patchValue(transportista);
        } else if (response.error) {
          this.error = response.error;
        }
      },
      error: () => {
        this.error = 'Error al cargar el transportista: Fallo de conexión.';
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.transportistaId = +params['id'];
        this.cargarTransportista(this.transportistaId);
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
    if (this.transportistaForm.invalid) {
      this.transportistaForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }
    const transportistaData: Transportista = this.transportistaForm.value;
    console.log('Datos enviados:', transportistaData);
    if (this.isEditMode && this.transportistaId) {
      this.transportistaService.actualizarTransportista(this.transportistaId, transportistaData).subscribe({
        next: (response) => {
            this.successMessage = 'Transportista actualizado correctamente.';
            this.notificationService.success(this.successMessage);
            this.transportistaGuardado.emit();
            this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al actualizar el transportista.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    } else {
      this.transportistaService.crearTransportista(transportistaData).subscribe({
        next: (response) => {
            this.successMessage = 'Transportista creado correctamente.';
            this.notificationService.success(this.successMessage);
            this.transportistaGuardado.emit();
            this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al crear el transportista.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.transportistaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.transportistaForm.get(fieldName);

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