
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
  template: `
    <section class="container py-4">

      <h2>Gestión de usuarios</h2>

      <p class="text-muted">
        Busca usuarios y asigna el rol de repartidor.
      </p>

      <div class="mb-3">
        <label class="form-label">Buscar usuario</label>

        <input
          class="form-control"
          [(ngModel)]="busqueda"
          placeholder="Nombre, usuario o rol"
        />
      </div>

      <button
        class="btn btn-outline-success mb-3"
        (click)="cargar()">
        Actualizar usuarios
      </button>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div *ngIf="mensaje" class="alert alert-success">
        {{ mensaje }}
      </div>

      <p *ngIf="cargando">Cargando usuarios...</p>

      <div class="table-responsive" *ngIf="!cargando">
        <table class="table table-striped align-middle">

          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol actual</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let u of filtrados">

              <td>{{ u.idUsuario }}</td>
              <td>{{ u.nombre }}</td>
              <td>{{ u.usuario }}</td>
              <td>{{ u.rol }}</td>

              <td>
                <ng-container *ngIf="u.rol !== 'ADMIN'">

                  <button
                    class="btn btn-success btn-sm me-2"
                    [disabled]="guardando || u.rol === 'REPARTIDOR'"
                    (click)="cambiarRol(u, 'REPARTIDOR')">
                    Hacer repartidor
                  </button>

                  <button
                    class="btn btn-outline-secondary btn-sm"
                    [disabled]="guardando || u.rol === 'CLIENTE'"
                    (click)="cambiarRol(u, 'CLIENTE')">
                    Hacer cliente
                  </button>

                </ng-container>

                <span
                  *ngIf="u.rol === 'ADMIN'"
                  class="text-muted">
                  Administrador protegido
                </span>
              </td>

            </tr>

            <tr *ngIf="filtrados.length === 0">
              <td colspan="5">
                No se encontraron usuarios.
              </td>
            </tr>
          </tbody>

        </table>
      </div>
    </section>
  `
})
export class AdminUsuariosComponent implements OnInit {

  private reportes = inject(ReporteService);
  private http = inject(HttpClient);

  usuarios: ReporteUsuarioDTO[] = [];

  busqueda = '';
  cargando = false;
  guardando = false;

  error = '';
  mensaje = '';

  ngOnInit(): void {
    this.cargar();
  }

  get filtrados(): ReporteUsuarioDTO[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.usuarios.filter(u =>
      [u.nombre, u.usuario, u.rol]
        .some(valor =>
          (valor ?? '').toLowerCase().includes(texto)
        )
    );
  }

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

  
async cambiarRol(
  usuario: ReporteUsuarioDTO,
  rol: 'CLIENTE' | 'REPARTIDOR'
): Promise<void> {

  if (this.guardando || usuario.rol === 'ADMIN') {
    return;
  }

  const resultado = await Swal.fire({
    title: '¿Cambiar rol del usuario?',
    text: `¿Deseas cambiar el rol de ${usuario.usuario} a ${rol}?`,
    icon: 'question',

    showCancelButton: true,

    confirmButtonText: 'Sí, cambiar rol',
    cancelButtonText: 'Cancelar',

    confirmButtonColor: '#198754',
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
        confirmButtonColor: '#198754'
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
        confirmButtonColor: '#198754'
      });
    }

  });
}

}
