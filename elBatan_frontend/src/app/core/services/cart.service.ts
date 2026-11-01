import { computed, inject, Injectable, signal } from '@angular/core';
import { AlertService } from './alert.service';
import { CartItem } from '../Interfaces/cart-item.interface';
import { Producto } from '../Interfaces/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private alertService = inject(AlertService);
  private cartItems = signal<CartItem[]>(this.loadCart());

  totalItems = computed(() => this.cartItems().length);

  getItems() {
    return this.cartItems();
  }

  private loadCart(): CartItem[] {
    const cart = localStorage.getItem('cart_ecommerce');
    return cart ? JSON.parse(cart) : [];

  }

  //si el m+étodo es privado
  private saveCart() {
    localStorage.setItem('cart_ecommerce', JSON.stringify(this.cartItems()))
  }

  totalPrice = computed(() =>
    this.cartItems().reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0)
  )

  agregarProducto(producto: Producto) {
    const actualItem = this.cartItems();
    const itemExistente = actualItem.find(item => item.producto.id === producto.id);
    if (itemExistente) {
      itemExistente.cantidad++;
      this.cartItems.set([...actualItem]);
    } else {
      this.cartItems.set([...actualItem, { producto, cantidad: 1 }])
    }
    this.saveCart();
    this.alertService.toast(`Añadido: ${producto.nombre}`)
  }

  eliminarItem(id:number){
    this.cartItems.set(this.cartItems().filter(item => item.producto.id !== id));
    this.saveCart();
    this.alertService.toast('Producto eliminado');
  }

  actualizarCantidad(id:number, delta:number){
    const items = this.cartItems().map(item =>{
      if(item.producto.id === id){
        const nuevaCant = item.cantidad + delta;
        return {...item, cantidad: nuevaCant>0 ? nuevaCant:1}
      }
      return item;
    });
    this.cartItems.set(items);
    this.saveCart();
  }

  vaciarCarrito(){
    this.cartItems.set([]);
    this.saveCart();
  }
}
