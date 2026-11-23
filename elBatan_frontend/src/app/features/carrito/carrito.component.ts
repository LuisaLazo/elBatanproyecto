
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VentaDTO } from '../../core/Interfaces/pedido.interface';
import { AlertService } from '../../core/services/alert.service';
import { CartService } from '../../core/services/cart.service';
import { PedidoService } from '../../core/services/pedido.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  readonly cartService = inject(CartService);
  private readonly alertService = inject(AlertService);
  private readonly pedidoService = inject(PedidoService);
  private readonly router = inject(Router);

  direccion = '';
  referencia = '';
  telefonoEntrega = '';
  enviando = false;

  async pagar(): Promise<void> {
    const carrito = this.cartService.getItems();

    if (this.enviando || carrito.length === 0) {
      return;
    }

    if (!localStorage.getItem('elBatan.token')) {
  await this.router.navigate(['/home'], {
    queryParams: { acceso: 'login' }
  });
  return;
}

    const direccion = this.direccion.trim();
    const telefonoEntrega = this.telefonoEntrega.trim();

    if (!direccion || !/^\d{9}$/.test(telefonoEntrega)) {
      this.alertService.error('Ingresa tu dirección y un teléfono de 9 dígitos.');
      return;
    }

    this.enviando = true;

    const confirmado = await this.alertService.confirm(
      '¿Deseas confirmar tu pedido de delivery?'
    );

    if (!confirmado) {
      this.enviando = false;
      return;
    }

    const pedido: VentaDTO = {
      direccion,
      referencia: this.referencia.trim(),
      telefonoEntrega,
      items: carrito.map(item => ({
        idProducto: item.producto.id!,
        cantidad: item.cantidad
      }))
    };

    this.pedidoService.crearPedido(pedido).subscribe({
      next: (respuesta) => {
        this.enviando = false;
        this.cartService.vaciarCarrito();

        this.alertService.success(
          `Tu pedido ${respuesta.codigoPedido} está en preparación.`,
          'Pedido confirmado'
        );
      },
      error: (respuesta) => {
        this.enviando = false;

        if (respuesta.status === 401) {
          this.alertService.error(
            'Inicia sesión de nuevo para continuar con tu pedido.'
          );
          return;
        }

        this.alertService.error(
          respuesta.error?.message || 'No se pudo guardar el pedido. Revisa los datos y el stock.'
        );
      }
    });
  }
}
