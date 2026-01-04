import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Subscription } from 'rxjs';
import { Usuario } from '../../../../core/models/usuario.interface';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-app-usuarios-list',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MatButtonToggleModule],
  templateUrl: './app-usuarios-list.component.html',
  styleUrls: ['./app-usuarios-list.component.css']
})
export class AppUsuariosListComponent implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  loading = false;
  error = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private usuariosService: UsuariosService,
    private notificacionService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();

    const sub = this.usuariosService.obtenerUsuarios().subscribe({
      next: (response) => {
        if (response.success) {
          this.usuarios = Array.isArray(response.data)
            ? response.data.filter(u => u.id !== currentUser?.id)
            : [];
        } else {
          this.error = 'Error al cargar usuarios';
          this.notificacionService.error(this.error);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        console.error(err);
        this.notificacionService.error(this.error);
        this.loading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  cambiarEstadoUsuario(usuario: Usuario, nuevoEstado: 'activo' | 'inactivo'): void {
    const estadoBooleano = nuevoEstado === 'activo';
    if (usuario.activo === estadoBooleano) return; // no hacer nada si no cambia

    const sub = this.usuariosService.toggleActivoUsuario(usuario.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificacionService.success(response.mensaje);
          this.cargarUsuarios();
        } else {
          this.notificacionService.error('Error al cambiar estado del usuario');
        }
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.error('Error al cambiar estado del usuario');
      }
    });

    this.subscriptions.push(sub);
  }

  cambiarRolUsuario(usuario: Usuario, rolSeleccionado: 'admin' | 'usuario'): void {
    if (usuario.rol === rolSeleccionado) return; // No hacer nada si no cambia

    const sub = this.usuariosService.cambiarRolUsuario(usuario.id, rolSeleccionado).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificacionService.success(response.mensaje);
          this.cargarUsuarios();
        } else {
          this.notificacionService.error('Error al cambiar rol del usuario');
        }
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.error('Error al cambiar rol del usuario');
      }
    });

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}