
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

import {
  PedidoRepartidor,
  PedidoService
} from '../../core/services/pedido.service';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-repartidor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './repartidor.component.html',
  styleUrl: './repartidor.component.css'
})
export class RepartidorComponent implements OnInit {

  private readonly pedidoService = inject(PedidoService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  disponibles: PedidoRepartidor[] = [];
  misEntregas: PedidoRepartidor[] = [];

  archivos: Record<number, File | undefined> = {};

  cargando = false;
  procesando = false;

  error = '';
  mensaje = '';

  // ======================================
  // PESTAÑAS
  // ======================================

  pestanaActiva: 'disponibles' | 'entregas' =
    'disponibles';

  ngOnInit(): void {
    this.cargarPedidos();
  }

  // ======================================
  // ESTADÍSTICAS
  // ======================================

  get totalDisponibles(): number {
    return this.disponibles.length;
  }

  get totalPendientes(): number {
    return this.misEntregas.filter(
      pedido => pedido.estado === 'EN_CAMINO'
    ).length;
  }

  get totalEntregados(): number {
    return this.misEntregas.filter(
      pedido => pedido.estado === 'RECIBIDO'
    ).length;
  }

  // ======================================
  // CARGAR PEDIDOS
  // ======================================

  cargarPedidos(): void {

    this.cargando = true;
    this.error = '';

    forkJoin({
      disponibles: this.pedidoService.listarDisponibles(),
      entregas: this.pedidoService.listarMisEntregas()
    })
      .pipe(
        finalize(() => this.cargando = false)
      )
      .subscribe({

        next: respuesta => {
          this.disponibles = respuesta.disponibles;
          this.misEntregas = respuesta.entregas;
        },

        error: error => {
          console.error('Error cargando pedidos:', error);

          this.error =
            'No se pudieron cargar los pedidos. ' +
            'Comprueba tu conexión y permisos.';
        }

      });
  }

  // ======================================
  // TOMAR PEDIDO CON SWEETALERT2
  // ======================================

  async tomarPedido(
    pedido: PedidoRepartidor
  ): Promise<void> {

    if (this.procesando) {
      return;
    }

    const codigoPedido = this.codigo(pedido);

    const resultado = await Swal.fire({

      title: '¿Tomar este pedido?',

      text:
        `¿Deseas encargarte de entregar el pedido ` +
        `${codigoPedido}? Una vez confirmado, ` +
        `quedará asignado a tu usuario.`,

      icon: 'question',

      showCancelButton: true,

      confirmButtonText: 'Sí, tomar pedido',
      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',

      reverseButtons: true,
      focusCancel: true

    });

    if (!resultado.isConfirmed || this.procesando) {
      return;
    }

    this.procesando = true;
    this.error = '';
    this.mensaje = '';

    Swal.fire({
      title: 'Asignando pedido...',
      text: 'Espera un momento.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,

      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.pedidoService
      .tomarPedido(pedido.idPedido)
      .pipe(
        finalize(() => this.procesando = false)
      )
      .subscribe({

        next: async () => {

          Swal.close();

          this.pestanaActiva = 'entregas';

          this.mensaje =
            'Pedido asignado correctamente.';

          this.cargarPedidos();

          await Swal.fire({

            title: '¡Pedido asignado!',

            text:
              `El pedido ${codigoPedido} ahora está ` +
              `a tu cargo. Puedes encontrarlo en ` +
              `"Mis entregas".`,

            icon: 'success',

            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#198754'

          });
        },

        error: async error => {

          Swal.close();

          console.error('Error tomando pedido:', error);

          let mensajeError =
            'No se pudo tomar el pedido. ' +
            'Inténtalo nuevamente.';

          if (error.status === 401) {
            mensajeError =
              'Tu sesión ha expirado. ' +
              'Vuelve a iniciar sesión.';

          } else if (error.status === 403) {
            mensajeError =
              'No tienes permisos para tomar pedidos.';

          } else if (error.status === 409) {
            mensajeError =
              'Este pedido ya fue tomado por ' +
              'otro repartidor.';
          }

          this.error = mensajeError;

          this.cargarPedidos();

          await Swal.fire({

            title: 'No se pudo tomar el pedido',

            text: mensajeError,

            icon: 'error',

            confirmButtonText: 'Entendido',
            confirmButtonColor: '#198754'

          });
        }

      });
  }

  // ======================================
  // SELECCIONAR EVIDENCIA
  // ======================================

  async seleccionarArchivo(
    idPedido: number,
    evento: Event
  ): Promise<void> {

    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    this.error = '';

    if (!archivo) {
      delete this.archivos[idPedido];
      return;
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png'
    ];

    const maximo = 5 * 1024 * 1024;

    // VALIDAR FORMATO
    if (!tiposPermitidos.includes(archivo.type)) {

      delete this.archivos[idPedido];
      input.value = '';

      await Swal.fire({

        title: 'Formato no permitido',

        text:
          'Solo puedes subir fotografías ' +
          'en formato JPG o PNG.',

        icon: 'warning',

        confirmButtonText: 'Entendido',
        confirmButtonColor: '#198754'

      });

      return;
    }

    // VALIDAR TAMAÑO
    if (archivo.size > maximo) {

      delete this.archivos[idPedido];
      input.value = '';

      await Swal.fire({

        title: 'Imagen demasiado grande',

        text:
          'La fotografía no debe superar los 5 MB.',

        icon: 'warning',

        confirmButtonText: 'Entendido',
        confirmButtonColor: '#198754'

      });

      return;
    }

    this.archivos[idPedido] = archivo;
  }

  // ======================================
  // CONFIRMAR ENTREGA CON SWEETALERT2
  // ======================================

  async confirmarEntrega(
    pedido: PedidoRepartidor
  ): Promise<void> {

    if (this.procesando) {
      return;
    }

    const archivo = this.archivos[pedido.idPedido];

    // VERIFICAR FOTOGRAFÍA
    if (!archivo) {

      await Swal.fire({

        title: 'Fotografía requerida',

        text:
          'Debes seleccionar una fotografía ' +
          'como evidencia de la entrega.',

        icon: 'warning',

        confirmButtonText: 'Entendido',
        confirmButtonColor: '#198754'

      });

      return;
    }

    const codigoPedido = this.codigo(pedido);

    // CONFIRMAR ENTREGA
    const resultado = await Swal.fire({

      title: '¿Confirmar entrega?',

      text:
        `¿Confirmas que el pedido ${codigoPedido} ` +
        `fue entregado correctamente? ` +
        `Se guardará la fotografía como evidencia.`,

      icon: 'question',

      showCancelButton: true,

      confirmButtonText: 'Sí, confirmar entrega',
      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',

      reverseButtons: true,
      focusCancel: true

    });

    if (!resultado.isConfirmed || this.procesando) {
      return;
    }

    this.procesando = true;
    this.error = '';
    this.mensaje = '';

    // MOSTRAR CARGA
    Swal.fire({

      title: 'Confirmando entrega...',

      text: 'Guardando la fotografía de evidencia.',

      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,

      didOpen: () => {
        Swal.showLoading();
      }

    });

    // ENVIAR AL BACKEND
    this.pedidoService
      .confirmarEntrega(pedido.idPedido, archivo)
      .pipe(
        finalize(() => this.procesando = false)
      )
      .subscribe({

        next: async () => {

          Swal.close();

          delete this.archivos[pedido.idPedido];

          this.mensaje =
            'Entrega confirmada correctamente.';

          this.cargarPedidos();

          await Swal.fire({

            title: '¡Entrega confirmada!',

            text:
              `El pedido ${codigoPedido} fue ` +
              `registrado como entregado. ` +
              `La fotografía se guardó correctamente.`,

            icon: 'success',

            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#198754'

          });
        },

        error: async error => {

          Swal.close();

          console.error(
            'Error confirmando entrega:',
            error
          );

          let mensajeError =
            'No se pudo confirmar la entrega.';

          if (error.status === 401) {
            mensajeError =
              'Tu sesión ha expirado. ' +
              'Vuelve a iniciar sesión.';

          } else if (error.status === 403) {
            mensajeError =
              'No tienes permisos para confirmar entregas.';

          } else if (error.status === 413) {
            mensajeError =
              'La fotografía supera el tamaño permitido.';
          }

          this.error = mensajeError;

          await Swal.fire({

            title: 'Error al confirmar entrega',

            text: mensajeError,

            icon: 'error',

            confirmButtonText: 'Entendido',
            confirmButtonColor: '#198754'

          });
        }

      });
  }

  // ======================================
  // VER EVIDENCIA
  // ======================================

  verEvidencia(
    pedido: PedidoRepartidor
  ): void {

    this.error = '';

    const ventana = window.open('', '_blank');

    this.pedidoService
      .obtenerEvidencia(pedido.idPedido)
      .subscribe({

        next: blob => {

          const url = URL.createObjectURL(blob);

          if (ventana) {
            ventana.location.href = url;

            setTimeout(() => {
              URL.revokeObjectURL(url);
            }, 60000);

          } else {

            URL.revokeObjectURL(url);

            void Swal.fire({

              title: 'Ventana bloqueada',

              text:
                'El navegador bloqueó la ventana ' +
                'para visualizar la evidencia.',

              icon: 'warning',

              confirmButtonColor: '#198754'

            });
          }
        },

        error: error => {

          console.error(
            'Error obteniendo evidencia:',
            error
          );

          ventana?.close();

          void Swal.fire({

            title: 'No se pudo abrir la evidencia',

            text:
              'Ocurrió un error al obtener ' +
              'la fotografía del pedido.',

            icon: 'error',

            confirmButtonColor: '#198754'

          });
        }

      });
  }

  // ======================================
  // UTILIDADES
  // ======================================

  codigo(
    pedido: PedidoRepartidor
  ): string {

    return pedido.codigoPedido ||
      `#${pedido.idPedido}`;
  }

  cambiarPestana(
    pestana: 'disponibles' | 'entregas'
  ): void {

    this.pestanaActiva = pestana;
  }

  cerrarSesion(): void {

    this.authService.cerrarSesion();

    void this.router.navigate(['/login']);
  }

  trackByPedido(
    index: number,
    pedido: PedidoRepartidor
  ): number {

    return pedido.idPedido;
  }

}
