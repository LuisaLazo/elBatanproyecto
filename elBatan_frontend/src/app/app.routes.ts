
import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  Router,
  Routes
} from '@angular/router';

import { AdminLayoutComponent } from './shared/admin-layout/admin-layout.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';

import { HomeComponent } from './features/home/home.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { CarritoComponent } from './features/carrito/carrito.component';
import { ReportesComponent } from './features/reportes/reportes.component';

// ======================================
// ROLES DE LA SESIÓN
// ======================================

function obtenerRoles(): string[] {
  return (localStorage.getItem('elBatan.roles') ?? '')
    .split(',')
    .map(rol =>
      rol.trim()
        .toUpperCase()
        .replace(/^ROLE_/, '')
    )
    .filter(Boolean);
}

// ======================================
// GUARD DE ADMINISTRADOR
// ======================================

const requiereAdmin: CanActivateChildFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('elBatan.token');

  if (!token) {
    return router.createUrlTree(['/home'], {
      queryParams: { acceso: 'login' }
    });
  }

  return obtenerRoles().includes('ADMIN')
    ? true
    : router.createUrlTree(['/home']);
};

// ======================================
// GUARD DE REPARTIDOR
// ======================================

const requiereRepartidor: CanActivateChildFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('elBatan.token');

  if (!token) {
    return router.createUrlTree(['/home'], {
      queryParams: { acceso: 'login' }
    });
  }

  return obtenerRoles().includes('REPARTIDOR')
    ? true
    : router.createUrlTree(['/home']);
};

// ======================================
// RUTAS DE LA APLICACIÓN
// ======================================

export const routes: Routes = [

  // ADMINISTRACIÓN
  {
    path: '',
    component: AdminLayoutComponent,
    canActivateChild: [requiereAdmin],
    children: [
      {
        path: 'admin/pedidos',
        loadComponent: () =>
          import('./features/admin-pedidos/admin-pedidos.component')
            .then(m => m.AdminPedidosComponent)
      },
      {
        path: 'admin/reportes',
        component: ReportesComponent
      },
      {
        path: 'admin/usuarios',
        loadComponent: () =>
          import('./features/admin-usuarios/admin-usuarios.component')
            .then(m => m.AdminUsuariosComponent)
      },
      {
        path: 'productos',
        component: ProductListComponent
      },
      {
        path: 'productos/nuevo',
        component: ProductFormComponent
      },
      {
        path: 'productos/editar/:id',
        component: ProductFormComponent
      }
    ]
  },

  // REPARTIDOR
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [requiereRepartidor],
    children: [
      {
        path: 'repartidor',
        loadComponent: () =>
          import('./features/repartidor/repartidor.component')
            .then(m => m.RepartidorComponent)
      }
    ]
  },

  // PÁGINAS PRINCIPALES
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'carrito',
        component: CarritoComponent
      },
      {
        path: 'mis-pedidos',
        loadComponent: () =>
          import('./features/mis-pedidos/mis-pedidos.component')
            .then(m => m.MisPedidosComponent)
      }
    ]
  },

  // RUTA DESCONOCIDA
  {
    path: '**',
    redirectTo: 'home'
  }
];
