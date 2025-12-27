import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertasCadenaFrioService } from '../../../../core/services/alertasCadenaFrio.service';
import { AlertaCadenaFrio } from '../../../../core/models/alertaCadenaFrio';
import { MedicionesTempService } from '../../../../core/services/medicionesTemp.service';
import { LotesService } from '../../../../core/services/lotes.service';
import { MedicionTemp } from '../../../../core/models/medicionTemp';
import { Lote } from '../../../../core/models/lote';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-app-alerta-cadena-frio-form',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule],
  templateUrl: './app-alerta-cadena-frio-form.component.html',
  styleUrl: './app-alerta-cadena-frio-form.component.css'
})
export class AppAlertaCadenaFrioFormComponent implements OnInit {

  alertaForm: FormGroup;
  isEditMode: boolean = false;
  alertaId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  mediciones: MedicionTemp[] = [];
  lotes: Lote[] = [];

  @Output() alertaGuardada = new EventEmitter<void>();

  abrirModal(alertaId?: number): void {
    this.showModal = true;
    this.error = '';
    this.successMessage = '';

    if (alertaId) {
      this.isEditMode = true;
      this.alertaId = alertaId;
      this.cargarAlerta(alertaId);
    } else {
      this.isEditMode = false;
      this.alertaId = null;
      this.alertaForm.reset({
        id_medicion: '',
        id_lote: '',
        tipo_alerta: ''
      });
    }   
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly alertasService: AlertasCadenaFrioService,
    private readonly medicionesService: MedicionesTempService,
    private readonly lotesService: LotesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.alertaForm = this.fb.group({
      id_medicion: ['', [Validators.required]],
      id_lote: ['', [Validators.required]],
      tipo_alerta: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarMediciones();
    this.cargarLotes();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.alertaId = +params['id'];
        this.cargarAlerta(this.alertaId);
      }
    });
  }

  cargarMediciones() {
    this.medicionesService.obtenerMediciones().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.mediciones = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar mediciones:', err);
      }
    });
  }

  cargarLotes() {
    this.lotesService.obtenerLotes().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.lotes = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar lotes:', err);
      }
    });
  }

  cargarAlerta(id: number) {
    this.alertasService.obtenerAlertaPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const alerta = response.data;
          this.alertaForm.patchValue(alerta);
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar la alerta.';
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
    if (this.alertaForm.invalid) {
      this.alertaForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }
    const alertaData: AlertaCadenaFrio = this.alertaForm.value;

    if (this.isEditMode && this.alertaId) {
      // Para editar, cambiar estado
      this.alertasService.cambiarEstadoAlerta(this.alertaId, alertaData.estado).subscribe({
        next: (response) => {
          this.successMessage = 'Estado de alerta actualizado correctamente.';
          this.notificationService.success(this.successMessage);
          this.alertaGuardada.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al actualizar la alerta.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    } else {
      this.alertasService.crearAlerta(alertaData).subscribe({
        next: (response) => {
          this.successMessage = 'Alerta creada correctamente.';
          this.notificationService.success(this.successMessage);
          this.alertaGuardada.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al crear la alerta.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.alertaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.alertaForm.get(fieldName);

    if (!field) {
      return '';
    }

    switch (fieldName) {
      case 'id_medicion':
        if (field.hasError('required')) {
          return 'La medición es obligatoria';
        }
        break;
      case 'id_lote':
        if (field.hasError('required')) {
          return 'El lote es obligatorio';
        }
        break;
      case 'tipo_alerta':
        if (field.hasError('required')) {
          return 'El tipo de alerta es obligatorio';
        }
        break;
    }

    return '';
  }
}