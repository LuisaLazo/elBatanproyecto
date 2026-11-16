import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const rutaPedidos = '/elBatan/api/v1/pedidos';
  const rutaProductos = '/elBatan/api/v1/productos';

  const esPedido =
    request.url === rutaPedidos ||
    request.url.startsWith(`${rutaPedidos}/`);

  const esProducto =
    request.url === rutaProductos ||
    request.url.startsWith(`${rutaProductos}/`);

  const modificaProducto =
    esProducto && ['POST', 'PUT', 'DELETE'].includes(request.method);

  const token = localStorage.getItem('elBatan.token');

  if (!token || !(esPedido || modificaProducto)) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};