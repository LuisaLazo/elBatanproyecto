
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AlertService } from '../../core/services/alert.service';
import { Router, RouterLink } from '@angular/router';
import { ItemVentaDTO, VentaDTO } from '../../core/Interfaces/pedido.interface';
import { PedidoService } from '../../core/services/pedido.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {

  public cartService = inject(CartService);

  private pedidoService = inject(PedidoService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  direccionEntrega: string = '';

  // Este valor debe obtenerse del cliente que inició sesión.
  // No debemos dejar un ID fijo para las ventas reales.
 idPersona: number | null = 3;

  async pagar() {

    if (this.cartService.getItems().length === 0) {
      this.alertService.error('El carrito está vacío');
      return;
    }

    if (!this.direccionEntrega.trim()) {
      this.alertService.error('Ingresa la dirección de entrega');
      return;
    }

    if (this.idPersona === null) {
      this.alertService.error('No se ha identificado al cliente. Inicia sesión primero.');
      return;
    }

    const confirmado = await this.alertService.confirm(
      '¿Deseas confirmar tu compra?'
    );

    if (!confirmado) return;

    const itemsEnvio: ItemVentaDTO[] =
      this.cartService.getItems().map(item => ({
        idProducto: item.producto.id!,
        cantidad: item.cantidad
      }));

    const pedidoFinal: VentaDTO = {
      idPersona: this.idPersona,
      direccion: this.direccionEntrega,
      items: itemsEnvio
    };

    this.pedidoService.crearPedido(pedidoFinal).subscribe({
      next: (res) => {
        this.alertService.success(
          'Tu pedido ha sido registrado correctamente',
          '¡Venta realizada!'
        );

        this.cartService.vaciarCarrito();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        const msg = err.error?.message
          || 'No se pudo procesar el pedido';

        this.alertService.error(msg, 'Error en la venta');
      }
    });
  }
}
