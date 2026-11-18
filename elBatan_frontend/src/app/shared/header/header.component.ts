import { Component, inject } from '@angular/core';
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

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    void this.router.navigate(['/home']);
  }
}