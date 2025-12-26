import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Usuario } from '../../../../core/models/usuario.interface';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';

@Component({
  selector: 'app-app-usuarios-list',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule],
  templateUrl: './app-usuarios-list.component.html',
  styleUrls: ['./app-usuarios-list.component.css']
})
export class AppUsuariosListComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = false;
  error = '';

  constructor(
    private usuariosService: UsuariosService,
    private notificacionService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (response) => {
        if (response.success) {
          this.usuarios = response.data;
        } else {
          this.notificacionService.error('Error al cargar usuarios');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.notificacionService.error('Error al cargar usuarios');
        this.loading = false;
      }
    });
  }

  toggleActivoUsuario(usuario: Usuario): void {
    this.usuariosService.toggleActivoUsuario(usuario.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificacionService.success(response.mensaje);
          this.cargarUsuarios(); // Recargar lista
        } else {
          this.notificacionService.error('Error al cambiar estado del usuario');
        }
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.notificacionService.error('Error al cambiar estado del usuario');
      }
    });
  }

  cambiarRolUsuario(usuario: Usuario): void {
    const nuevoRol = usuario.rol === 'admin' ? 'usuario' : 'admin';
    this.usuariosService.cambiarRolUsuario(usuario.id, nuevoRol).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificacionService.success(response.mensaje);
          this.cargarUsuarios(); // Recargar lista
        } else {
          this.notificacionService.error('Error al cambiar rol del usuario');
        }
      },
      error: (error) => {
        console.error('Error al cambiar rol:', error);
        this.notificacionService.error('Error al cambiar rol del usuario');
      }
    });
  }
}