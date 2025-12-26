import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransportistasService } from '../../../../core/services/transportistas.service';
import { Transportista } from '../../../../core/models/transportista';

@Component({
  selector: 'app-app-transportista-form',
  imports: [CommonModule, ReactiveFormsModule],
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
      this.transportistaForm.reset();
    }
  }

  constructor(
    private fb: FormBuilder,
    private transportistaService: TransportistasService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.transportistaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      licencia: ['', [Validators.required]],
      telefono: [''],
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
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      return;
    }
    const transportistaData: Transportista = this.transportistaForm.value;
    console.log('Datos enviados:', transportistaData);
    if (this.isEditMode && this.transportistaId) {
      this.transportistaService.actualizarTransportista(this.transportistaId, transportistaData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Transportista actualizado correctamente.';
            this.transportistaGuardado.emit();
            this.cerrarModal();
          } else {
            this.error = response.mensaje || 'Error al actualizar el transportista.';
          }
        },
        error: () => {
          this.error = 'Error de conexión al actualizar el transportista.';
        }
      });
    } else {
      this.transportistaService.crearTransportista(transportistaData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Transportista creado correctamente.';
            this.transportistaGuardado.emit();
            this.cerrarModal();
          } else {
            this.error = response.mensaje || 'Error al crear el transportista.';
          }
        },
        error: () => {
          this.error = 'Error de conexión al crear el transportista.';
        }
      });
    }
  }
}