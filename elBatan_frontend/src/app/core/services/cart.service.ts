import { computed, inject, Injectable, signal } from '@angular/core';
import { AlertService } from './alert.service';
import { CartItem } from '../Interfaces/cart-item.interface';
import { Producto } from '../Interfaces/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly alertService = inject(AlertService);
  private readonly limitePorProducto = 20;
  private readonly cartItems = signal<CartItem[]>(this.loadCart());

  totalItems = computed(() => this.cartItems().length);

  totalPrice = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0
    )
  );

  getItems() {
    return this.cartItems();
  }

  maxCantidad(producto: Producto): number {
    return Math.max(0, Math.min(this.limitePorProducto, producto.stock));
  }

  private loadCart(): CartItem[] {
    const cart = localStorage.getItem('cart_ecommerce');
    const items: CartItem[] = cart ? JSON.parse(cart) : [];

    return items.map(item => ({
      ...item,
      cantidad: Math.min(item.cantidad, this.limitePorProducto)
    }));
  }

  private saveCart(): void {
    localStorage.setItem('cart_ecommerce', JSON.stringify(this.cartItems()));
  }

  agregarProducto(producto: Producto): void {
    const items = this.cartItems();
    const existente = items.find(item => item.producto.id === producto.id);
    const cantidad = (existente?.cantidad ?? 0) + 1;
    const maximo = this.maxCantidad(producto);

    if (cantidad > maximo) {
      this.alertService.error(
        maximo === 0
          ? 'Este producto está agotado.'
          : `Puedes agregar hasta ${maximo} unidades de este producto.`
      );
      return;
    }

    const nuevosItems = existente
      ? items.map(item => item === existente ? { producto, cantidad } : item)
      : [...items, { producto, cantidad }];

    this.cartItems.set(nuevosItems);
    this.saveCart();
    this.alertService.toast(`Añadido: ${producto.nombre}`);
  }

  eliminarItem(id: number): void {
    this.cartItems.set(this.cartItems().filter(item => item.producto.id !== id));
    this.saveCart();
    this.alertService.toast('Producto eliminado');
  }

  actualizarCantidad(id: number, delta: number): void {
    this.cartItems.update(items => items.map(item => {
      if (item.producto.id !== id) return item;

      const cantidad = Math.max(1, item.cantidad + delta);

      if (delta > 0 && cantidad > this.maxCantidad(item.producto)) {
        return item;
      }

      return { ...item, cantidad };
    }));

    this.saveCart();
  }

  vaciarCarrito(): void {
    this.cartItems.set([]);
    this.saveCart();
  }
}