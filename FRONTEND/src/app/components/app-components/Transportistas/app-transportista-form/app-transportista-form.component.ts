import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class AppTransportistaFormComponent implements OnInit, OnDestroy {

  transportistaForm: FormGroup;
  isEditMode: boolean = false;
  transportistaId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  private subscriptions: Subscription[] = [];

  tiposVehiculo = [
    'Camión Refrigerado', 'Furgoneta', 'Camión Plataforma', 'Tráiler',
    'Camión Cisterna', 'Camión Caja Seca', 'Camión Volquete',
    'Motocarga', 'Camioneta Pickup', 'Camión Portacontenedores',
    'Camión Grúa', 'Camión Basculante'
  ];

  @Output() transportistaGuardado = new EventEmitter<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly transportistaService: TransportistasService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.transportistaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      licencia: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern('^[0-9]+$')]],
      tipo_vehiculo: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const routeSub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.transportistaId = +params['id'];
        this.cargarTransportista(this.transportistaId);
      }
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

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

  cargarTransportista(id: number) {
    const sub = this.transportistaService.obtenerTransportistaPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          this.transportistaForm.patchValue(response.data as Transportista);
        } else if (response.error) {
          this.error = response.error;
        }
      },
      error: () => {
        this.error = 'Error al cargar el transportista: Fallo de conexión.';
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
    if (this.transportistaForm.invalid) {
      this.transportistaForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }

    const transportistaData: Transportista = this.transportistaForm.value;
    const sub = (this.isEditMode && this.transportistaId
      ? this.transportistaService.actualizarTransportista(this.transportistaId, transportistaData)
      : this.transportistaService.crearTransportista(transportistaData)
    ).subscribe({
      next: (response) => {
        this.successMessage = this.isEditMode ? 'Transportista actualizado correctamente.' : 'Transportista creado correctamente.';
        this.notificationService.success(this.successMessage);
        this.transportistaGuardado.emit();
        this.cerrarModal();
      },
      error: (err) => {
        this.error = this.isEditMode ? 'Error de conexión al actualizar el transportista.' : 'Error de conexión al crear el transportista.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
      }
    });

    this.subscriptions.push(sub);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.transportistaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.transportistaForm.get(fieldName);
    if (!field) return '';

    switch (fieldName) {
      case 'nombre':
        if (field.hasError('required')) return 'El nombre es obligatorio';
        if (field.hasError('minlength')) return 'El nombre debe tener al menos 3 caracteres';
        if (field.hasError('pattern')) return 'El nombre solo puede contener letras';
        break;
      case 'licencia':
        if (field.hasError('required')) return 'La licencia es obligatoria';
        break;
      case 'telefono':
        if (field.hasError('required')) return 'El teléfono es obligatorio';
        if (field.hasError('pattern')) return 'El teléfono solo puede contener números';
        if (field.hasError('minlength') || field.hasError('maxlength')) return 'El teléfono debe tener exactamente 9 dígitos';
        break;
      case 'tipo_vehiculo':
        if (field.hasError('required')) return 'Debe seleccionar un tipo de vehículo';
        break;
    }
    return '';
  }
}