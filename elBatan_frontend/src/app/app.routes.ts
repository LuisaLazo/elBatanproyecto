import { inject } from '@angular/core';
import { CanActivateChildFn, Router, Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/admin-layout/admin-layout.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { CarritoComponent } from './features/carrito/carrito.component';
import { ReportesComponent } from './features/reportes/reportes.component';

const requiereAdmin: CanActivateChildFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('elBatan.token');

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  const roles = (localStorage.getItem('elBatan.roles') ?? '').split(',');
  return roles.includes('ADMIN') ? true : router.createUrlTree(['/home']);
};

export const routes: Routes = [
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
      { path: 'productos', component: ProductListComponent },
      { path: 'productos/nuevo', component: ProductFormComponent },
      { path: 'productos/editar/:id', component: ProductFormComponent }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: HomeComponent },
      { path: 'carrito', component: CarritoComponent },
      {
        path: 'mis-pedidos',
        loadComponent: () =>
          import('./features/mis-pedidos/mis-pedidos.component')
            .then(m => m.MisPedidosComponent)
      },
      {
        path: 'registro',
        loadComponent: () =>
          import('./features/registro/registro.component')
            .then(m => m.RegistroComponent)
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/login/login.component')
            .then(m => m.LoginComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];