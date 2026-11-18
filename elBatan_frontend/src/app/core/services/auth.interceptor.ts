import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const ruta = request.url.split('?')[0];
  const rutaPedidos = '/elBatan/api/v1/pedidos';
  const rutaProductos = '/elBatan/api/v1/productos';

  const esPedido =
    ruta === rutaPedidos || ruta.startsWith(`${rutaPedidos}/`);

  const esProducto =
    ruta === rutaProductos || ruta.startsWith(`${rutaProductos}/`);

  const modificaProducto =
    esProducto && ['POST', 'PUT', 'DELETE'].includes(request.method);

  const token = localStorage.getItem('elBatan.token');

  if (!token || !(esPedido || modificaProducto)) {
    return next(request);
  }

  const router = inject(Router);
  const authService = inject(AuthService);

  const solicitud = request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(solicitud).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        localStorage.getItem('elBatan.token') === token
      ) {
        const vieneDelCarrito = router.url.split(/[?#]/)[0] === '/carrito';

        authService.cerrarSesion();

        void router.navigate(['/login'], {
          queryParams: vieneDelCarrito ? { destino: 'carrito' } : {}
        });
      }

      return throwError(() => error);
    })
  );
};