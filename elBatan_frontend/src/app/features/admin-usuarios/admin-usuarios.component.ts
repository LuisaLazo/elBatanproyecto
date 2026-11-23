
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

import { ReporteService } from '../../core/services/reporte.service';
import { ReporteUsuarioDTO } from '../../core/Interfaces/reporte-usuario.interface';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent implements OnInit {

  private readonly reportes = inject(ReporteService);
  private readonly http = inject(HttpClient);

  usuarios: ReporteUsuarioDTO[] = [];

  busqueda = '';
  cargando = false;
  guardando = false;

  error = '';
  mensaje = '';

  // =====================================
  // CARGAR AL INICIAR
  // =====================================

  ngOnInit(): void {
    this.cargar();
  }

  // =====================================
  // FILTRAR USUARIOS
  // =====================================

  get filtrados(): ReporteUsuarioDTO[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.usuarios.filter(u =>
      [u.nombre, u.usuario, u.rol]
        .some(valor =>
          (valor ?? '').toLowerCase().includes(texto)
        )
    );
  }

  // =====================================
  // CARGAR USUARIOS
  // =====================================

  cargar(): void {
    this.cargando = true;
    this.error = '';

    this.reportes.listarUsuarios().subscribe({
      next: datos => {
        this.usuarios = datos;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios';
        this.cargando = false;
      }
    });
  }

  // =====================================
  // CAMBIAR ROL
  // =====================================

  async cambiarRol(
    usuario: ReporteUsuarioDTO,
    rol: 'CLIENTE' | 'REPARTIDOR'
  ): Promise<void> {

    if (
      this.guardando ||
      usuario.rol === 'ADMIN' ||
      usuario.rol === rol
    ) {
      return;
    }

    const resultado = await Swal.fire({
      title: '¿Cambiar rol del usuario?',
      text: `¿Deseas cambiar el rol de ${usuario.usuario} a ${rol}?`,
      icon: 'question',

      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar rol',
      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#254832',
      cancelButtonColor: '#6c757d',

      reverseButtons: true,
      focusCancel: true
    });

    if (!resultado.isConfirmed) {
      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    this.http.put(
      `/elBatan/api/v1/admin/usuarios/${usuario.idUsuario}/rol`,
      { rol }
    ).subscribe({

      next: async () => {
        this.guardando = false;

        await Swal.fire({
          title: '¡Rol actualizado!',
          text:
            `El usuario ${usuario.usuario} ahora tiene ` +
            `el rol ${rol}. Deberá volver a iniciar sesión.`,
          icon: 'success',

          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#254832'
        });

        this.cargar();
      },

      error: async (err) => {
        this.guardando = false;

        console.error('Error cambiando rol:', err);

        let mensajeError =
          'No se pudo actualizar el rol del usuario.';

        if (err.status === 401) {
          mensajeError =
            'Tu sesión expiró. Vuelve a iniciar sesión.';
        } else if (err.status === 403) {
          mensajeError =
            'No tienes permisos para cambiar roles.';
        } else if (err.status === 404) {
          mensajeError =
            'El usuario seleccionado no existe.';
        }

        await Swal.fire({
          title: 'No se pudo cambiar el rol',
          text: mensajeError,
          icon: 'error',

          confirmButtonText: 'Entendido',
          confirmButtonColor: '#254832'
        });
      }
    });
  }
}
