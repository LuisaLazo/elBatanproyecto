
import { HttpClient } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  inject,
  input,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],

  // ======================================
  // HTML DEL COMPONENTE
  // ======================================

  template: `
    <section
      class="registro-page"
      [class.en-modal]="enModal()"
      aria-labelledby="registro-titulo">

      <div class="registro-card">

        <!-- ENCABEZADO -->
        <header class="registro-header">

          <span class="registro-icono" aria-hidden="true">
            <i class="bi bi-person-plus"></i>
          </span>

          <h1 id="registro-titulo">
            Crear cuenta
          </h1>

        </header>

        <div class="registro-body">

          <!-- REGISTRO EXITOSO -->
          @if (creada) {

            <p class="alert alert-success" role="status">
              Tu cuenta fue creada correctamente.
            </p>

            @if (enModal()) {

              <button
                type="button"
                class="btn btn-registro w-100"
                (click)="pedirLogin.emit()">

                Iniciar sesión
              </button>

            } @else {

              <a
                class="btn btn-registro w-100"
                routerLink="/login">

                Iniciar sesión
              </a>

            }

          } @else {

            <!-- FORMULARIO -->
            <form
              #formulario="ngForm"
              (ngSubmit)="registrar()">

              <div class="row g-3">

                <!-- NOMBRE -->
                <div class="col-12">

                  <label for="nombre" class="form-label">
                    Nombre completo
                  </label>

                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    class="form-control"
                    [(ngModel)]="datos.nombre"
                    autocomplete="name"
                    required>

                </div>

                <!-- CORREO -->
                <div class="col-12 col-md-6">

                  <label for="email" class="form-label">
                    Correo electrónico
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    class="form-control"
                    [(ngModel)]="datos.email"
                    autocomplete="email"
                    email
                    required>

                </div>

                <!-- TELÉFONO -->
                <div class="col-12 col-md-6">

                  <label for="telefono" class="form-label">
                    Teléfono
                  </label>

                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    class="form-control"
                    [(ngModel)]="datos.telefono"
                    autocomplete="tel"
                    inputmode="numeric"
                    pattern="[0-9]{9}"
                    maxlength="9"
                    required>

                </div>

                <!-- DIRECCIÓN -->
                <div class="col-12">

                  <label for="direccion" class="form-label">
                    Dirección
                  </label>

                  <input
                    id="direccion"
                    name="direccion"
                    type="text"
                    class="form-control"
                    [(ngModel)]="datos.direccion"
                    autocomplete="street-address"
                    required>

                </div>

                <!-- USUARIO -->
                <div class="col-12 col-md-6">

                  <label for="usuario" class="form-label">
                    Usuario
                  </label>

                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    class="form-control"
                    [(ngModel)]="datos.usuario"
                    autocomplete="username"
                    required>

                </div>

                <!-- CONTRASEÑA -->
                <div class="col-12 col-md-6">

                  <label for="password" class="form-label">
                    Contraseña
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    class="form-control"
                    [(ngModel)]="datos.password"
                    autocomplete="new-password"
                    required>

                </div>

              </div>

              <!-- MENSAJE DE ERROR -->
              @if (error) {

                <p
                  class="alert alert-danger mt-3 mb-0"
                  role="alert">

                  {{ error }}

                </p>

              }

              <!-- BOTÓN REGISTRAR -->
              <button
                type="submit"
                class="btn btn-registro w-100 mt-4"
                [disabled]="formulario.invalid || enviando">

                {{ enviando ? 'Creando cuenta…' : 'Crear cuenta' }}

              </button>

            </form>

            <!-- CAMBIAR A LOGIN -->
            <p class="registro-login">

              ¿Ya tienes cuenta?

              @if (enModal()) {

                <button
                  type="button"
                  class="btn btn-link p-0 link-success fw-bold"
                  (click)="pedirLogin.emit()">

                  Inicia sesión

                </button>

              } @else {

                <a routerLink="/login">
                  Inicia sesión
                </a>

              }

            </p>

          }

        </div>
      </div>
    </section>
  `,

  // ======================================
  // CSS DEL COMPONENTE
  // ======================================

  styles: [`
    .registro-page {
      --verde-batan: #2e5337;
      --verde-oscuro: #24432c;
      --borde: #e3e1d8;

      display: grid;
      justify-items: center;
      padding: clamp(1.5rem, 5vw, 3.5rem) 1rem;
    }

    .registro-page.en-modal {
      padding: 0;
    }

    .registro-card {
      width: min(100%, 620px);
      overflow: hidden;
      border: 1px solid var(--borde);
      border-radius: 1.25rem;
      background: #fff;
      box-shadow: 0 12px 32px rgb(36 56 40 / 10%);
    }

    .en-modal .registro-card {
      width: 100%;
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }

    .registro-header {
      padding: 1.5rem 1.25rem;
      background: var(--verde-batan);
      color: #fff;
      text-align: center;
    }

    .registro-icono {
      display: inline-grid;
      width: 2.75rem;
      height: 2.75rem;
      margin-bottom: .65rem;
      place-items: center;
      border: 1px solid rgb(255 255 255 / 35%);
      border-radius: 50%;
      font-size: 1.35rem;
    }

    .registro-header h1 {
      margin: 0;
      font-size: clamp(1.55rem, 4vw, 1.9rem);
      font-weight: 700;
    }

    .registro-body {
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

    .btn-registro {
      --bs-btn-color: #fff;
      --bs-btn-bg: var(--verde-batan);
      --bs-btn-border-color: var(--verde-batan);

      --bs-btn-hover-color: #fff;
      --bs-btn-hover-bg: var(--verde-oscuro);
      --bs-btn-hover-border-color: var(--verde-oscuro);

      --bs-btn-active-color: #fff;
      --bs-btn-active-bg: var(--verde-oscuro);
      --bs-btn-active-border-color: var(--verde-oscuro);

      --bs-btn-disabled-color: #fff;
      --bs-btn-disabled-bg: var(--verde-batan);
      --bs-btn-disabled-border-color: var(--verde-batan);

      --bs-btn-focus-shadow-rgb: 46, 83, 55;

      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 2.85rem;
      border-radius: .65rem;
      font-weight: 600;
    }

    .registro-login {
      margin: 1.25rem 0 0;
      padding-top: 1.15rem;
      border-top: 1px solid var(--borde);
      color: #505b51;
      text-align: center;
      font-size: .95rem;
    }

    .registro-login a {
      color: var(--verde-batan);
      font-weight: 700;
      text-underline-offset: .2em;
    }

    .registro-login button {
      text-decoration: none;
    }

    .registro-login button:hover {
      text-decoration: underline;
    }

    @media (max-width: 576px) {
      .registro-body {
        padding: 1.25rem;
      }

      .registro-header {
        padding: 1.25rem;
      }
    }
  `]
})
export class RegistroComponent {

  // ======================================
  // INPUTS Y OUTPUTS DEL MODAL
  // ======================================

  readonly enModal = input(false);
  readonly pedirLogin = output<void>();

  // ======================================
  // SERVICIOS
  // ======================================

  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);

  // ======================================
  // DATOS DEL FORMULARIO
  // ======================================

  datos = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    usuario: '',
    password: ''
  };

  // ======================================
  // ESTADOS
  // ======================================

  enviando = false;
  creada = false;
  error = '';

  // ======================================
  // REGISTRAR CLIENTE
  // ======================================

  registrar(): void {

    if (this.enviando || this.creada) {
      return;
    }

    this.error = '';
    this.enviando = true;

    const datosRegistro = {
      nombre: this.datos.nombre.trim(),
      email: this.datos.email.trim(),
      telefono: this.datos.telefono.trim(),
      direccion: this.datos.direccion.trim(),
      usuario: this.datos.usuario.trim(),
      password: this.datos.password
    };

    this.http.post(
      '/elBatan/api/v1/auth/registro',
      datosRegistro
    )
    .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({

      next: () => {
        this.enviando = false;
        this.creada = true;
        this.datos.password = '';
      },

      error: respuesta => {
        this.enviando = false;

        this.error = respuesta.status === 0
          ? 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.'
          : 'No se pudo crear la cuenta. Revisa los datos y usa un correo y un usuario nuevos.';
      }

    });
  }
}
