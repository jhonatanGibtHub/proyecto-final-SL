import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorTemp, SensorTempResponse } from '../../../../core/models/sensorTemp';
import { SensoresTempService } from '../../../../core/services/sensoresTemp.service';
import { AppSensorTempFormComponent } from '../app-sensor-temp-form/app-sensor-temp-form.component';

@Component({
  selector: 'app-app-sensor-temp-list',
  imports: [CommonModule, AppSensorTempFormComponent],
  templateUrl: './app-sensor-temp-list.component.html',
  styleUrl: './app-sensor-temp-list.component.css'
})
export class AppSensorTempListComponent implements OnInit {
  sensores: SensorTemp[] = [];
  error: string = '';

  @ViewChild(AppSensorTempFormComponent) sensorTempFormModal!: AppSensorTempFormComponent;

  abrirModalNuevo(): void {
    this.sensorTempFormModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.sensorTempFormModal.abrirModal(id);
  }

  constructor(private sensoresTempService: SensoresTempService) {}

  ngOnInit(): void {
    this.cargarSensores();
  }

  cargarSensores() {
    this.sensoresTempService.obtenerSensores().subscribe({
      next: (response: SensorTempResponse) => {
        if (response.success && Array.isArray(response.data)) {
          this.sensores = response.data;
          console.log('Sensores cargados:', this.sensores);
        } else if (response.success && !response.data) {
          this.sensores = [];
        } else {
          this.error = response.mensaje || 'Error al obtener la lista de sensores de temperatura.';
          this.sensores = [];
        }
      },
      error: (err) => {
        this.error = 'Error de conexión con el servidor.';
        console.error('Error HTTP:', err);
      }
    });
  }

  onSensorTempGuardado() {
    this.cargarSensores();
  }
}