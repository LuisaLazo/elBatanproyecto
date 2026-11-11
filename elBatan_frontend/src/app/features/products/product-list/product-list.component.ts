import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/Interfaces/producto.interface';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductoService);
  private alertService = inject(AlertService);

  products: Producto[] = [];
  busqueda = '';
  estado: 'cargando' | 'listo' | 'error' = 'cargando';
  eliminandoId: number | null = null;

  get disponibles(): number {
    return this.products.filter(producto => producto.stock > 0).length;
  }

  get productosFiltrados(): Producto[] {
    const consulta = this.busqueda.trim().toLocaleLowerCase('es');
    return this.products.filter(producto =>
      (producto.nombre + ' ' + (producto.descripcion || '')).toLocaleLowerCase('es').includes(consulta)
    );
  }

  ngOnInit(): void {
    this.listProduct();
  }

  listProduct(): void {
    this.estado = 'cargando';
    this.productService.getProductos().subscribe({
      next: productos => {
        this.products = productos;
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

  async eliminar(id: number): Promise<void> {
    if (this.eliminandoId !== null) return;
    this.eliminandoId = id;
    const confirmado = await this.alertService.confirm('¿Deseas eliminar este producto?');
    if (!confirmado) {
      this.eliminandoId = null;
      return;
    }
    this.productService.deleteProduct(id).pipe(
      finalize(() => this.eliminandoId = null)
    ).subscribe({
      next: () => {
        this.products = this.products.filter(producto => producto.id !== id);
        this.alertService.toast('Producto eliminado');
      },
      error: () => this.alertService.error('No se pudo eliminar el producto')
    });
  }
}
