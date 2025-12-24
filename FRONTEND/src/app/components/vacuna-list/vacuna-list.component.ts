import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// 1. IMPORTAMOS LA ENTIDAD Y EL TIPO DE RESPUESTA DE NUESTRO PROYECTO STGCF
import { Vacuna, VacunaResponse } from '../../core/models/vacuna'; 
import { VacunasService } from '../../core/services/vacunas.service'


@Component({
  selector: 'app-vacuna-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './vacuna-list.component.html',
  styleUrl: './vacuna-list.component.css'
})
export class VacunaListComponent  implements OnInit{
// Lista donde se guardarán los objetos de tipo Vacuna
  vacunas: Vacuna[] = [];
  error: string = '';
  
  // Inyección de dependencia del servicio
  constructor(private vacunaService: VacunasService) {
  }
  
  ngOnInit(): void {
    this.cargarVacunas();
  }
  
 
  cargarVacunas() {
    this.vacunaService.obtenerVacunas().subscribe({
   
      next: (response: VacunaResponse) => {
    
        if (response.success && Array.isArray(response.data)) {
          this.vacunas = response.data;
          console.log('Vacunas cargadas:', this.vacunas);
        } else if (response.success && !response.data) {
          
           this.vacunas = [];
        } else {
           
           this.error = response.mensaje || 'Error al obtener la lista de vacunas.';
           this.vacunas = [];
        }
      },
      error: (err) => {
      
        this.error = 'Error de conexión con el servidor.';
        console.error('Error HTTP:', err);
      }
    });
  }

 
  eliminarVacuna(id: number | undefined) {
    if (!id) return; 
    
    if (confirm('ADVERTENCIA: ¿Estás seguro de eliminar esta vacuna? Si existen lotes asociados, la operación fallará.')) {
      this.vacunaService.eliminarVacuna(id).subscribe({
        next: (response: VacunaResponse) => {
          if (response.success) {
            alert('Vacuna eliminada exitosamente.');
            this.cargarVacunas(); 
          } else {
       
            this.error = response.mensaje || 'Error al eliminar la vacuna.';
            alert(this.error);
          }
        },
        error: (err) => {
          this.error = 'Error de servidor al intentar eliminar.';
          console.error('Error HTTP:', err);
        }
      });
    }
  }

}
