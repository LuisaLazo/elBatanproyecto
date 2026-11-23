
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {

  const router = inject(Router);
  const authService = inject(AuthService);

  // Obtener el token JWT del usuario autenticado
  const token = localStorage.getItem('elBatan.token');

  // Identificar las solicitudes de nuestra API
  const esApiElBatan =
    request.url.startsWith('/elBatan/api/');

  // No agregar JWT a otras solicitudes
  if (!token || !esApiElBatan) {
    return next(request);
  }

  // Agregar el JWT al encabezado Authorization
  const solicitud = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(solicitud).pipe(

    catchError((error: unknown) => {

      // Si el token es inválido o expiró
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        localStorage.getItem('elBatan.token') === token
      ) {

        // Comprobar si el usuario estaba en el carrito
        const vieneDelCarrito =
          router.url.split(/[?#]/)[0] === '/carrito';

        // Cerrar la sesión
        authService.cerrarSesion();

        // Redirigir al login
        void router.navigate(['/login'], {
          queryParams: vieneDelCarrito
            ? { destino: 'carrito' }
            : {}
        });
      }

      return throwError(() => error);
    })

  );
};
