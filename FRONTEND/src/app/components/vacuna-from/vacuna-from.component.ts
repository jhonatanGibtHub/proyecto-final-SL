import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Importamos el servicio y las interfaces
import { VacunasService } from '../../services/vacunas.service';
import { Vacuna } from '../../models/vacuna'; // Asumo que el modelo está en vacunas.ts


@Component({
  selector: 'app-vacuna-from',
  standalone: true,
  // ⬅️ CORRECCIÓN DE ERRORES: Módulos necesarios para *ngIf, [formGroup] y routerLink
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
 templateUrl: './vacuna-from.component.html', 
  styleUrl: './vacuna-from.component.css'
})
export class VacunaFromComponent implements OnInit {

  vacunaForm: FormGroup;
  isEditMode: boolean = false;
  vacunaId: number | null = null;
  error: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private vacunaService: VacunasService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Definición de los campos y validadores
    this.vacunaForm = this.fb.group({
      nombre_comercial: ['', [Validators.required, Validators.minLength(3)]],
      fabricante: ['', [Validators.required, Validators.minLength(3)]],
      // Validadores para los rangos de temperatura
      temp_min_c: ['', [Validators.required, Validators.min(-100), Validators.pattern(/^-?\d*\.?\d*$/)]], 
      temp_max_c: ['', [Validators.required, Validators.max(100), Validators.pattern(/^-?\d*\.?\d*$/)]],
    });
  }

  cargarVacuna(id: number) {
    this.vacunaService.obtenerVacunaPorId(id).subscribe(
      {
        next: (response) => {
          if (response.success && response.data && !Array.isArray(response.data)) {
            this.vacunaForm.patchValue(response.data as Vacuna); 
          } else if (response.error) {
            this.error = response.error;
          }
        },
        error: (err) => {
          this.error = "Error al cargar la vacuna: Fallo de conexión.";
        }
      }
    );
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.vacunaId = +params['id']; 
        this.cargarVacuna(this.vacunaId);
      }
    });
  }

  onSubmit() {
    this.error = '';
    this.successMessage = '';
    
    // Detener si el formulario no es válido
    if (this.vacunaForm.invalid) {
        this.error = 'Por favor, rellene todos los campos requeridos correctamente.';
        return;
    }
    
    // Validación de regla de negocio: Mínima no puede ser mayor o igual a Máxima
    const { temp_min_c, temp_max_c } = this.vacunaForm.value;
    if (temp_min_c >= temp_max_c) {
        this.error = 'La Temperatura Mínima debe ser estrictamente menor que la Temperatura Máxima.';
        return;
    }

    const vacunaData: Vacuna = this.vacunaForm.value;

    if (this.isEditMode && this.vacunaId) {
      // MODO EDICIÓN (PUT)
      this.vacunaService.actualizarVacuna(this.vacunaId, vacunaData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = "Vacuna actualizada correctamente.";
            setTimeout(() => {
              this.router.navigate(['/vacunas']);
            }, 1500);
          } else {
            this.error = response.mensaje || "Error al actualizar la vacuna.";
          }
        },
        error: (err) => {
          this.error = "Error de conexión al actualizar la vacuna.";
        }
      });
    } else {
      // MODO CREACIÓN (POST)
      this.vacunaService.crearVacuna(vacunaData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = "Vacuna creada correctamente.";
            setTimeout(() => {
              this.router.navigate(['/vacunas']);
            }, 1500);
          } else {
            this.error = response.mensaje || "Error al crear la vacuna.";
          }
        },
        error: (err) => {
          this.error = "Error de conexión al crear la vacuna.";
        }
      });
    }
  }

}