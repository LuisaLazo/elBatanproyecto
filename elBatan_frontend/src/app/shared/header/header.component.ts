import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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

  get sesionIniciada(): boolean {
    return Boolean(localStorage.getItem('elBatan.token'));
  }

  get esAdmin(): boolean {
    const roles = localStorage.getItem('elBatan.roles') ?? '';
    return this.sesionIniciada && roles.split(',').includes('ADMIN');
  }

  cerrarSesion(): void {
    localStorage.removeItem('elBatan.token');
    localStorage.removeItem('elBatan.roles');
    void this.router.navigate(['/home']);
  }
}