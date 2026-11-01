import { Component, inject, OnInit } from '@angular/core';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/Interfaces/producto.interface';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  private productoService = inject(ProductoService);
  private cartService = inject(CartService);

  productos: Producto[] = [];

  ngOnInit(): void {
   this.loadingProducts();
  }

loadingProducts() {
  this.productoService.getProductos().subscribe({
    next: (data) => {
      console.log('Productos recibidos:', data);
      this.productos = data;
    },
    error: (err) => {
      console.error('Error al cargar productos:', err);
    }
  });
}
  agregarAlCarrito(producto:Producto){
    this.cartService.agregarProducto(producto);
  }

}
