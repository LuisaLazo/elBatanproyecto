
import { Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  // =====================================
  // EVENTO PARA ABRIR EL MODAL
  // =====================================

  readonly abrirAcceso = output<void>();

  // =====================================
  // SERVICIOS
  // =====================================

  readonly cartService = inject(CartService);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly estadoSesion = toSignal(
    this.authService.isLoggedIn$,
    { requireSync: true }
  );

  // =====================================
  // ESTADO DE LA SESIÓN
  // =====================================

  get sesionIniciada(): boolean {
    return this.estadoSesion();
  }

  // =====================================
  // ROLES DEL USUARIO
  // =====================================

  private get rolesUsuario(): string[] {

    if (!this.sesionIniciada) {
      return [];
    }

    return (localStorage.getItem('elBatan.roles') ?? '')
      .split(',')
      .map(rol =>
        rol.trim()
          .toUpperCase()
          .replace(/^ROLE_/, '')
      )
      .filter(rol => rol.length > 0);
  }

  // =====================================
  // ADMINISTRADOR
  // =====================================

  get esAdmin(): boolean {
    return this.rolesUsuario.includes('ADMIN');
  }

  // =====================================
  // REPARTIDOR
  // =====================================

  get esRepartidor(): boolean {
    return this.rolesUsuario.includes('REPARTIDOR');
  }

  // =====================================
  // CLIENTE
  // =====================================

  get esCliente(): boolean {
    return this.rolesUsuario.includes('CLIENTE');
  }

  // =====================================
  // ABRIR LOGIN COMO MODAL
  // =====================================

  solicitarAcceso(evento: MouseEvent): void {

    if (
      evento.ctrlKey ||
      evento.metaKey ||
      evento.shiftKey ||
      evento.altKey ||
      evento.button !== 0
    ) {
      return;
    }

    evento.preventDefault();

    this.abrirAcceso.emit();
  }

  // =====================================
  // CERRAR SESIÓN
  // =====================================

  cerrarSesion(): void {

    this.cartService.vaciarCarrito();

    this.authService.cerrarSesion();

    void this.router.navigate(['/home']);
  }
}
