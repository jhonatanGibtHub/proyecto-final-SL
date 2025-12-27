import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistroMovimientoService } from '../../../../core/services/registroMovimiento.service';
import { RegistroMovimiento } from '../../../../core/models/registroMovimiento';
import { LotesService } from '../../../../core/services/lotes.service';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';
import { TransportistasService } from '../../../../core/services/transportistas.service';
import { Lote } from '../../../../core/models/lote';
import { Ubicacion } from '../../../../core/models/ubicacion';
import { Transportista } from '../../../../core/models/transportista';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-app-registro-movimiento-form',
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule
  ],
  templateUrl: './app-registro-movimiento-form.component.html',
  styleUrl: './app-registro-movimiento-form.component.css'
})
export class AppRegistroMovimientoFormComponent implements OnInit {

  movimientoForm: FormGroup;
  isEditMode: boolean = false;
  movimientoId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  lotes: Lote[] = [];
  ubicaciones: Ubicacion[] = [];
  transportistas: Transportista[] = [];

  @Output() movimientoGuardado = new EventEmitter<void>();

  abrirModal(movimientoId?: number): void {
    this.showModal = true;
    this.error = '';
    this.successMessage = '';

    if (movimientoId) {
      this.isEditMode = true;
      this.movimientoId = movimientoId;
      this.cargarMovimiento(movimientoId);
    } else {
      this.isEditMode = false;
      this.movimientoId = null;
       this.movimientoForm.reset({
        id_lote:'',
      ubicacion_origen: '',
      ubicacion_destino: '', 
      id_transportista: '', 
      fecha_envio: '', 
      fecha_recepcion: ''
      });
    }
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly movimientoService: RegistroMovimientoService,
    private readonly lotesService: LotesService,
    private readonly ubicacionesService: UbicacionesService,
    private readonly transportistasService: TransportistasService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {
    this.movimientoForm = this.fb.group({
      id_lote: ['', [Validators.required]],
      ubicacion_origen: ['', [Validators.required]],
      ubicacion_destino: ['', [Validators.required]],
      id_transportista: ['', [Validators.required]],
      fecha_envio: ['', [Validators.required]],
      fecha_recepcion: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarLotes();
    this.cargarUbicaciones();
    this.cargarTransportistas();
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

  cargarUbicaciones() {
    this.ubicacionesService.obtenerUbicaciones().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.ubicaciones = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar ubicaciones:', err);
      }
    });
  }

  cargarTransportistas() {
    this.transportistasService.obtenerTransportistas().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.transportistas = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar transportistas:', err);
      }
    });
  }

  cargarMovimiento(id: number) {
    this.movimientoService.obtenerMovimientoPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const movimiento = response.data as RegistroMovimiento;
          // Convertir fechas a formato YYYY-MM-DD para inputs date
          const movimientoData = {
            ...movimiento,
            fecha_envio: movimiento.fecha_envio ? new Date(movimiento.fecha_envio).toISOString().split('T')[0] : '',
            fecha_recepcion: movimiento.fecha_recepcion ? new Date(movimiento.fecha_recepcion).toISOString().split('T')[0] : ''
          };
          this.movimientoForm.patchValue(movimientoData);
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar el movimiento: Fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
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
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }
    const movimientoData: RegistroMovimiento = this.movimientoForm.value;
    if (this.isEditMode && this.movimientoId) {
      this.movimientoService.actualizarMovimiento(this.movimientoId, movimientoData).subscribe({
        next: (response) => {
          this.successMessage = 'Movimiento actualizado correctamente.';
          this.notificationService.success(this.successMessage);
          this.movimientoGuardado.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al actualizar el movimiento.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    } else {
      this.movimientoService.crearMovimiento(movimientoData).subscribe({
        next: (response) => {
            this.successMessage = 'Movimiento creado correctamente.';
            this.notificationService.success(this.successMessage);
            this.movimientoGuardado.emit();
            this.cerrarModal();
        },
        error: (err) => {
          this.error = 'Error de conexión al crear el movimiento.';
          const mensajeError = err.error?.mensaje;
          this.notificationService.error(mensajeError || this.error);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.movimientoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.movimientoForm.get(fieldName);

    if (!field) return '';

    if (field.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    return '';
  }
}