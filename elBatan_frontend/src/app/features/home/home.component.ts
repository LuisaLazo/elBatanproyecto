import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/Interfaces/producto.interface';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private productoService = inject(ProductoService);
  private cartService = inject(CartService);

  productos: Producto[] = [];
  estado: 'cargando' | 'listo' | 'error' = 'cargando';

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.estado = 'cargando';
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.estado = 'listo';
      },
      error: () => {
        this.estado = 'error';
      }
    });
  }

  mostrarImagenAlternativa(evento: Event): void {
    const imagen = evento.currentTarget as HTMLImageElement;
    if (imagen.getAttribute('src') !== 'producto-sin-foto.svg') {
      imagen.src = 'producto-sin-foto.svg';
    }
  }

  agregarAlCarrito(producto: Producto): void {
    this.cartService.agregarProducto(producto);
  }
}
