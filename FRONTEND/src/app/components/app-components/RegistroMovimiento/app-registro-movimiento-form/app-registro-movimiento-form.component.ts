import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule
  ],
  templateUrl: './app-registro-movimiento-form.component.html',
  styleUrl: './app-registro-movimiento-form.component.css'
})
export class AppRegistroMovimientoFormComponent implements OnInit, OnDestroy {

  movimientoForm: FormGroup;
  isEditMode: boolean = false;
  movimientoId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;

  lotes: Lote[] = [];
  ubicaciones_distribuidores: Ubicacion[] = [];
  ubicaciones_clientes: Ubicacion[] = [];
  transportistas: Transportista[] = [];

  @Output() movimientoGuardado = new EventEmitter<void>();

  // Arreglo de suscripciones para manejar cancelaciones
  private subscriptions: Subscription[] = [];

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
      fecha_envio: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarLotes();
    this.cargarUbicaciones_Distribuidores();
    this.cargarUbicaciones_Clientes();
    this.cargarTransportistas();
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones al destruir el componente
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  abrirModal(movimientoId?: number): void {
    this.showModal = true;
    this.error = '';
    this.successMessage = '';
    this.cargarLotes();

    if (movimientoId) {
      this.isEditMode = true;
      this.movimientoId = movimientoId;
      this.cargarMovimiento(movimientoId);
    } else {
      this.isEditMode = false;
      this.movimientoId = null;
      this.movimientoForm.reset({
        id_lote: '',
        ubicacion_origen: '',
        ubicacion_destino: '',
        id_transportista: '',
        fecha_envio: ''
      });
    }
  }

  private toMySQLDateTime(date: Date): string {
    const fecha = new Date(date);
    const ahora = new Date();

    fecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);

    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    const hh = String(fecha.getHours()).padStart(2, '0');
    const mi = String(fecha.getMinutes()).padStart(2, '0');
    const ss = String(fecha.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  cargarLotes(): void {
    const sub = this.lotesService.obtenerLotes_A_Enviar().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) this.lotes = res.data;
      },
      error: (err) => console.error('Error al cargar lotes:', err)
    });
    this.subscriptions.push(sub);
  }

  cargarUbicaciones_Distribuidores(): void {
    const sub = this.ubicacionesService.obtenerUbicacione_Distribudor().subscribe({
      next: (res) => { if (res.success && Array.isArray(res.data)) this.ubicaciones_distribuidores = res.data; },
      error: (err) => console.error('Error al cargar ubicaciones distribuidores:', err)
    });
    this.subscriptions.push(sub);
  }

  cargarUbicaciones_Clientes(): void {
    const sub = this.ubicacionesService.obtenerUbicacione_Clientes().subscribe({
      next: (res) => { if (res.success && Array.isArray(res.data)) this.ubicaciones_clientes = res.data; },
      error: (err) => console.error('Error al cargar ubicaciones clientes:', err)
    });
    this.subscriptions.push(sub);
  }

  cargarTransportistas(): void {
    const sub = this.transportistasService.obtenerTransportistas().subscribe({
      next: (res) => { if (res.success && Array.isArray(res.data)) this.transportistas = res.data; },
      error: (err) => console.error('Error al cargar transportistas:', err)
    });
    this.subscriptions.push(sub);
  }

  cargarMovimiento(id: number): void {
    const sub = this.movimientoService.obtenerMovimientoPorId(id).subscribe({
      next: (res) => {
        if (res.success && res.data && !Array.isArray(res.data)) {
          const movimiento = res.data as RegistroMovimiento;
          this.movimientoForm.patchValue({
            ...movimiento,
            fecha_envio: movimiento.fecha_envio ? new Date(movimiento.fecha_envio) : null
          });
        } else if (res.error) {
          this.error = res.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar el movimiento: fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
      }
    });
    this.subscriptions.push(sub);
  }

  cerrarModal(): void { this.showModal = false; }
  onCancel(): void { this.cerrarModal(); }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';

    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      this.notificationService.error(this.error);
      return;
    }

    const formValue = this.movimientoForm.value;
    const movimientoData: RegistroMovimiento = {
      ...formValue,
      fecha_envio: this.toMySQLDateTime(formValue.fecha_envio)
    };

    let sub;
    if (this.isEditMode && this.movimientoId) {
      sub = this.movimientoService.actualizarMovimiento(this.movimientoId, movimientoData).subscribe({
        next: () => {
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
      sub = this.movimientoService.crearMovimiento(movimientoData).subscribe({
        next: () => {
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

    this.subscriptions.push(sub);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.movimientoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.movimientoForm.get(fieldName);
    if (!field) return '';
    if (field.hasError('required')) return 'Este campo es obligatorio';
    return '';
  }
}