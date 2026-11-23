import { Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  readonly abrirAcceso = output<void>();
  readonly cartService = inject(CartService);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly estadoSesion = toSignal(this.authService.isLoggedIn$, {
    requireSync: true
  });

  get sesionIniciada(): boolean {
    return this.estadoSesion();
  }

  get esAdmin(): boolean {
    const roles = localStorage.getItem('elBatan.roles') ?? '';
    return this.sesionIniciada && roles.split(',').includes('ADMIN');
  }
  get esRepartidor(): boolean {
  const roles = localStorage.getItem('elBatan.roles') ?? '';

  return this.sesionIniciada &&
    roles.split(',').map(rol => rol.trim()).includes('REPARTIDOR');
}

  solicitarAcceso(evento: MouseEvent): void {
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;

    evento.preventDefault();

    const ruta = this.router.parseUrl(this.router.url).root.children['primary'];
    const pagina = ruta?.segments.length === 1 ? ruta.segments[0].path : '';

    if (pagina === 'login') return;

    if (pagina === 'registro') {
      void this.router.navigate(['/login']);
      return;
    }

    this.abrirAcceso.emit();
  }

  cerrarSesion(): void {
    this.cartService.vaciarCarrito();
    this.authService.cerrarSesion();
    void this.router.navigate(['/home']);
  }
}