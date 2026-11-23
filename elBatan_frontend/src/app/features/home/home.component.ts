import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly destroyRef = inject(DestroyRef);

  productos: Producto[] = [];
  estado: 'cargando' | 'listo' | 'error' = 'cargando';

  readonly destacados = [
    {
      imagen: 'pollo-a-la-brasa.webp',
      posicion: 'center 53%',
      titulo: 'Pollo a la brasa',
      descripcion: 'Con papas fritas y ensalada.'
    },
    {
      imagen: 'pizza-para-compartir.jpg',
      posicion: 'center',
      titulo: 'Pizza para compartir',
      descripcion: 'Una opción para disfrutar en la mesa.'
    }
  ];
  destacadoActual = 0;

  get platoDestacado() {
    return this.destacados[this.destacadoActual];
  }

  moverDestacado(paso: number): void {
    this.destacadoActual =
      (this.destacadoActual + paso + this.destacados.length) % this.destacados.length;
  }

  ngOnInit(): void {
    this.cargarProductos();

    this.productoService.observarProductos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(productos => {
        this.productos = productos;
        this.estado = 'listo';
      });
  }

  cargarProductos(): void {
    this.estado = 'cargando';
    this.productoService.getProductos().subscribe({
      next: productos => {
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