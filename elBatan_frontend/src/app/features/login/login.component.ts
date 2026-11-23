import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="login-page" [class.en-modal]="enModal()" aria-labelledby="login-titulo">
      <div class="login-card">
        <header class="login-header">
          <span class="login-icon" aria-hidden="true">
            <i class="bi bi-person"></i>
          </span>
          <h1 id="login-titulo">Iniciar sesión</h1>
        </header>

        <div class="login-body">
          <form (ngSubmit)="iniciarSesion()">
            <div class="mb-3">
              <label for="usuario" class="form-label">Usuario</label>
              <input id="usuario" name="usuario" type="text"
                     class="form-control" [(ngModel)]="usuario"
                     autocomplete="username" placeholder="Ingresa tu usuario"
                     required>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input id="password" name="password" type="password"
                     class="form-control" [(ngModel)]="password"
                     autocomplete="current-password"
                     placeholder="Ingresa tu contraseña" required>
            </div>

            @if (error) {
              <p class="alert alert-danger py-2" role="alert">{{ error }}</p>
            }

            <button class="btn login-submit w-100" type="submit"
                    [disabled]="cargando">
              {{ cargando ? 'Ingresando…' : 'Ingresar' }}
            </button>
          </form>

          <p class="login-registro">
            ¿Todavía no tienes cuenta?
            @if (enModal()) {
              <button type="button" class="btn btn-link p-0 link-success fw-bold"
                      (click)="pedirRegistro.emit()">Crear cuenta</button>
            } @else {
              <a routerLink="/registro">Crear cuenta</a>
            }
          </p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .login-page {
      --verde-batan: #2e5337;
      --borde: #e3e1d8;
      display: grid;
      justify-items: center;
      padding: clamp(2rem, 5vw, 4rem) 1rem;
    }

    .login-page.en-modal {
      padding: 0;
    }

    .login-card {
      width: min(100%, 440px);
      overflow: hidden;
      border: 1px solid var(--borde);
      border-radius: 1.25rem;
      background: #fff;
      box-shadow: 0 12px 32px rgb(36 56 40 / 10%);
    }

    .en-modal .login-card {
      width: 100%;
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }

    .login-header {
      padding: 1.75rem 1.25rem;
      background: var(--verde-batan);
      color: #fff;
      text-align: center;
    }

    .login-icon {
      display: inline-grid;
      width: 2.75rem;
      height: 2.75rem;
      margin-bottom: .65rem;
      place-items: center;
      border: 1px solid rgb(255 255 255 / 35%);
      border-radius: 50%;
      font-size: 1.35rem;
    }

    .login-header h1 {
      margin: 0;
      font-size: clamp(1.55rem, 4vw, 1.9rem);
      font-weight: 700;
    }

    .login-body {
      padding: clamp(1.25rem, 4vw, 2rem);
    }

    .form-label {
      color: #25372a;
      font-weight: 600;
    }

    .form-control {
      min-height: 2.85rem;
      border-color: #c9d0c8;
      border-radius: .65rem;
    }

    .form-control:focus {
      border-color: var(--verde-batan);
      box-shadow: 0 0 0 .2rem rgb(46 83 55 / 18%);
    }

    .login-submit {
      --bs-btn-color: #fff;
      --bs-btn-bg: var(--verde-batan);
      --bs-btn-border-color: var(--verde-batan);
      --bs-btn-hover-color: #fff;
      --bs-btn-hover-bg: #24432c;
      --bs-btn-hover-border-color: #24432c;
      --bs-btn-focus-shadow-rgb: 46, 83, 55;
      --bs-btn-active-color: #fff;
      --bs-btn-active-bg: #24432c;
      --bs-btn-active-border-color: #24432c;
      --bs-btn-disabled-color: #fff;
      --bs-btn-disabled-bg: var(--verde-batan);
      --bs-btn-disabled-border-color: var(--verde-batan);
      min-height: 2.85rem;
      border-radius: .65rem;
      font-weight: 600;
    }

    .login-registro {
      margin: 1.25rem 0 0;
      padding-top: 1.15rem;
      border-top: 1px solid var(--borde);
      color: #505b51;
      text-align: center;
      font-size: .95rem;
    }

    .login-registro a {
      color: var(--verde-batan);
      font-weight: 700;
      text-underline-offset: .2em;
    }
  `]
})
export class LoginComponent {
  readonly enModal = input(false);
  readonly pedirRegistro = output<void>();
  readonly sesionConfirmada = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  usuario = '';
  password = '';
  error = '';
  cargando = false;

  iniciarSesion(): void {
    const usuario = this.usuario.trim();

    if (this.cargando || !usuario || !this.password) {
      return;
    }

    this.error = '';
    this.cargando = true;

    this.authService.login({ usuario, password: this.password }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: ({ token, roles }) => {
        this.cargando = false;

        const vieneDelCarrito =
          this.route.snapshot.queryParamMap.get('destino') === 'carrito';

        if (vieneDelCarrito && !roles.includes('CLIENTE')) {
          this.error = 'Usa una cuenta con rol CLIENTE para hacer el pedido.';
          return;
        }

        this.authService.iniciarSesion(token, roles);

        const destino = vieneDelCarrito
          ? '/carrito'
          : roles.includes('ADMIN') ? '/admin/pedidos' : '/home';

        if (this.enModal()) {
          this.sesionConfirmada.emit();
          if (destino === '/home') return;
        }

        void this.router.navigate([destino]);
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo iniciar sesión. Revisa tus datos y que el backend esté encendido.';
      }
    });
  }
}