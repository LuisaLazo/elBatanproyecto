import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
            <form (submit)="$event.preventDefault(); buscarPedido(numeroPedido.value)">
              <label for="buscarPedido" class="form-label">Número de pedido</label>
              <div class="input-group">
                <input #numeroPedido id="buscarPedido" type="search"
                       class="form-control" inputmode="numeric"
                       pattern="[0-9]+" placeholder="Ej. 3">
                <button type="submit" class="btn btn-light">Buscar</button>
              </div>
            </form>

            <a class="nav-link text-white" routerLink="/admin/pedidos"
               routerLinkActive="bg-white bg-opacity-10 fw-semibold"
               ariaCurrentWhenActive="page"
               (click)="numeroPedido.value = ''">
              Ver todos los pedidos
            </a>

            <a class="nav-link text-white" routerLink="/productos"
               routerLinkActive="bg-white bg-opacity-10 fw-semibold"
               ariaCurrentWhenActive="page">
              Gestión de productos
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

  buscarPedido(numero: string): void {
    const pedido = numero.trim();

    void this.router.navigate(['/admin/pedidos'], {
      queryParams: pedido ? { pedido } : {}
    });
  }

  cerrarSesion(): void {
    localStorage.removeItem('elBatan.token');
    localStorage.removeItem('elBatan.roles');
    void this.router.navigate(['/login']);
  }
}