import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { CarritoComponent } from './features/carrito/carrito.component';
import { ReportesComponent } from './features/reportes/reportes.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children:[
        {path:'home', component:HomeComponent},
        { path: 'reportes', component: ReportesComponent },
        {path:'productos', component:ProductListComponent},
        {path:'productos/nuevo', component:ProductFormComponent},
        {path:'productos/editar/:id', component:ProductFormComponent},
        {path:'carrito', component:CarritoComponent},

        ]
    },
{
    path:'**', redirectTo:'home'




    }];
