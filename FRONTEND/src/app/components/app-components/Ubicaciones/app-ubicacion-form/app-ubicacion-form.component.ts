import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';
import { Ubicacion } from '../../../../core/models/ubicacion';

@Component({
  selector: 'app-app-ubicacion-form',
  imports: [CommonModule, ReactiveFormsModule],
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
      this.ubicacionForm.reset();
    }
  }

  constructor(
    private fb: FormBuilder,
    private ubicacionService: UbicacionesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.ubicacionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['', [Validators.required]],
      distrito: ['', [Validators.required]],
      provincia: ['']
    });
  }

  cargarUbicacion(id: number) {
    this.ubicacionService.obtenerUbicacionPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          const ubicacion = response.data as Ubicacion;
          this.ubicacionForm.patchValue(ubicacion);
        } else if (response.error) {
          this.error = response.error;
        }
      },
      error: () => {
        this.error = 'Error al cargar la ubicación: Fallo de conexión.';
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
      this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
      return;
    }
    const ubicacionData: Ubicacion = this.ubicacionForm.value;
    console.log('Datos enviados:', ubicacionData);
    if (this.isEditMode && this.ubicacionId) {
      this.ubicacionService.actualizarUbicacion(this.ubicacionId, ubicacionData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Ubicación actualizada correctamente.';
            this.ubicacionGuardado.emit();
            this.cerrarModal();
          } else {
            this.error = response.mensaje || 'Error al actualizar la ubicación.';
          }
        },
        error: () => {
          this.error = 'Error de conexión al actualizar la ubicación.';
        }
      });
    } else {
      this.ubicacionService.crearUbicacion(ubicacionData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Ubicación creada correctamente.';
            this.ubicacionGuardado.emit();
            this.cerrarModal();
          } else {
            this.error = response.mensaje || 'Error al crear la ubicación.';
          }
        },
        error: () => {
          this.error = 'Error de conexión al crear la ubicación.';
        }
      });
    }
  }
}