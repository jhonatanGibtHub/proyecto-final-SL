import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { VacunasService } from '../../../../core/services/vacunas.service';
import { Vacuna } from '../../../../core/models/vacuna';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';



@Component({
  selector: 'app-app-vacuna-form',
  imports: [CommonModule, ReactiveFormsModule, NgxSliderModule],
  templateUrl: './app-vacuna-form.component.html',
  styleUrl: './app-vacuna-form.component.css'
})
export class AppVacunaFormComponent implements OnInit {

  vacunaForm: FormGroup;
  isEditMode: boolean = false;
  vacunaId: number | null = null;
  error: string = '';
  successMessage: string = '';
  showModal: boolean = false;
  isPage: boolean = false;

  @Output() vacunaGuardado = new EventEmitter<void>();

  minValue: number = -20;
  maxValue: number = 8;

  options: Options = {
    floor: -100,
    ceil: 100,
    getSelectionBarColor: (value: number): string => {

      return '#1e88e5';
    }
  };


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
      this.minValue = -20;
      this.maxValue = 8;
      this.vacunaForm.reset();
      this.vacunaForm.patchValue({
        temp_min_c: this.minValue,
        temp_max_c: this.maxValue
      });
    }
  }

  constructor(
    private fb: FormBuilder,
    private vacunaService: VacunasService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.vacunaForm = this.fb.group({
      nombre_comercial: ['', [Validators.required, Validators.minLength(3)]],
      fabricante: ['', [Validators.required, Validators.minLength(3)]],
      temp_min_c: [this.minValue, [Validators.required, Validators.min(-100)]],
      temp_max_c: [this.maxValue, [Validators.required, Validators.max(100)]],
    });

  }

  cargarVacuna(id: number) {
  this.vacunaService.obtenerVacunaPorId(id).subscribe({
    next: (response) => {
      if (response.success && response.data && !Array.isArray(response.data)) {

        const vacuna = response.data as Vacuna;

        this.vacunaForm.patchValue(vacuna);

        // 🔥 sincronizar slider
        this.minValue = vacuna.temp_min_c;
        this.maxValue = vacuna.temp_max_c;

      } else if (response.error) {
        this.error = response.error;
      }
    },
    error: () => {
      this.error = 'Error al cargar la vacuna: Fallo de conexión.';
    }
  });
}


  ngOnInit(): void {
    this.isPage = !!this.route.snapshot.params['id'];
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.vacunaId = +params['id'];
        this.cargarVacuna(this.vacunaId);
      }
    });
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  onCancel(): void {
    if (this.isPage) {
      this.router.navigate(['/vacunas']);
    } else {
      this.cerrarModal();
    }
  }

  onMinChange(value: number) {
    this.minValue = value;
    this.vacunaForm.get('temp_min_c')?.setValue(value);
    if (this.minValue >= this.maxValue) {
      this.maxValue = this.minValue + 1;
      this.vacunaForm.get('temp_max_c')?.setValue(this.maxValue);
    }
  }

  onMaxChange(value: number) {
    this.maxValue = value;
    this.vacunaForm.get('temp_max_c')?.setValue(value);
    if (this.maxValue <= this.minValue) {
      this.minValue = this.maxValue - 1;
      this.vacunaForm.get('temp_min_c')?.setValue(this.minValue);
    }
  }

  onSubmit() {
  this.error = '';
  this.successMessage = '';

  // 🔥 FORZAR sincronización slider → formulario
  this.vacunaForm.patchValue({
    temp_min_c: this.minValue,
    temp_max_c: this.maxValue
  });

  if (this.vacunaForm.invalid) {
    this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
    return;
  }

  const { temp_min_c, temp_max_c } = this.vacunaForm.value;

  if (temp_min_c >= temp_max_c) {
    this.error = 'La Temperatura Mínima debe ser estrictamente menor que la Temperatura Máxima.';
    return;
  }

  const vacunaData: Vacuna = this.vacunaForm.value;

  // 🔍 DEBUG (puedes quitarlo luego)
  console.log('Datos enviados:', vacunaData);

  if (this.isEditMode && this.vacunaId) {
    this.vacunaService.actualizarVacuna(this.vacunaId, vacunaData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Vacuna actualizada correctamente.';
          this.vacunaGuardado.emit();
            this.cerrarModal();
          
        } else {
          this.error = response.mensaje || 'Error al actualizar la vacuna.';
        }
      },
      error: () => {
        this.error = 'Error de conexión al actualizar la vacuna.';
      }
    });
  } else {
    this.vacunaService.crearVacuna(vacunaData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Vacuna creada correctamente.';
          
           
            this.vacunaGuardado.emit();
            this.cerrarModal();
          
        } else {
          this.error = response.mensaje || 'Error al crear la vacuna.';
        }
      },
      error: () => {
        this.error = 'Error de conexión al crear la vacuna.';
      }
    });
  }
}


}
