import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container-fluid">
      <div class="row min-vh-100">
        <aside class="col-12 col-lg-3 col-xl-2 bg-batan-primary text-white p-4">
          <h1 class="h5 mb-4">El Batán · Administración</h1>

          <nav class="nav nav-pills flex-column gap-2" aria-label="Administración">
            <form (submit)="$event.preventDefault(); buscarPedido(codigoPedido.value)">
              <label for="buscarPedido" class="form-label">Código de pedido</label>
              <div class="input-group">
                <input #codigoPedido id="buscarPedido" type="search"
                       class="form-control" placeholder="Ej. BAT-23">
                <button type="submit" class="btn btn-light">Buscar</button>
              </div>
            </form>

            <a class="nav-link text-white" routerLink="/admin/pedidos"
               routerLinkActive="bg-white bg-opacity-10 fw-semibold"
               ariaCurrentWhenActive="page"
               (click)="codigoPedido.value = ''">
              Ver todos los pedidos
            </a>

            <a class="nav-link text-white" routerLink="/productos"
               routerLinkActive="bg-white bg-opacity-10 fw-semibold"
               ariaCurrentWhenActive="page">
              Gestión de productos
            </a>
            <a class="nav-link text-white"
              routerLink="/admin/reportes"
              routerLinkActive="bg-white bg-opacity-10 fw-semibold">
              Reportes
            </a>

            <a class="nav-link text-white"
              routerLink="/admin/usuarios"
              routerLinkActive="bg-white bg-opacity-10 fw-semibold">
              Gestión de usuarios
            </a>
          </nav>

          <div class="d-flex flex-wrap gap-2 mt-4">
            <a class="btn btn-outline-light btn-sm" routerLink="/home">Ver tienda</a>
            <button type="button" class="btn btn-outline-light btn-sm" (click)="cerrarSesion()">
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main class="col-12 col-lg-9 col-xl-10 bg-light p-3 p-lg-4">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  buscarPedido(codigo: string): void {
    const pedido = codigo.trim().toUpperCase();

    void this.router.navigate(['/admin/pedidos'], {
      queryParams: pedido ? { pedido } : {}
    });
  }

  cerrarSesion(): void {
  this.authService.cerrarSesion();

  void this.router.navigate(['/home']);
}
}