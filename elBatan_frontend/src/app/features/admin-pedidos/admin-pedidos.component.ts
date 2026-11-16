import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  PedidoHistorial,
  PedidoService
} from '../../core/services/pedido.service';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  template: `
    <section class="container my-4">
      <h1 class="h3 mb-3">Gestión de pedidos</h1>

      <div class="d-flex flex-wrap align-items-end gap-3 mb-3">
        <div>
          <label for="fechaPedido" class="form-label mb-1">Fecha del pedido</label>
          <input id="fechaPedido" type="date" class="form-control"
                 #calendario [value]="fechaSeleccionada"
                 (change)="fechaSeleccionada = calendario.value">
        </div>

        <button type="button" class="btn btn-outline-secondary"
                [disabled]="!fechaSeleccionada"
                (click)="fechaSeleccionada = ''">
          Limpiar fecha
        </button>
      </div>

      @if (error) {
        <p class="alert alert-warning" role="alert">{{ error }}</p>
      }

      @if (cargando) {
        <p>Cargando pedidos…</p>
      } @else {
        @for (pedido of pedidosVisibles; track pedido.idPedido) {
          <article class="card card-body mb-3">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <h2 class="h5 mb-0">Pedido #{{ pedido.idPedido }}</h2>

              <button type="button" class="btn btn-outline-success btn-sm"
                      (click)="imprimirTicket(pedido)">
                <i class="bi bi-printer me-1" aria-hidden="true"></i>
                Imprimir ticket
              </button>
            </div>

            @if (pedido.fecha; as fecha) {
              <p class="mb-1">
                Fecha: {{ fecha.slice(8, 10) }}/{{ fecha.slice(5, 7) }}/{{ fecha.slice(0, 4) }}
              </p>
            }

            <p class="mb-1">Cliente: {{ pedido.cliente }}</p>
            <p class="mb-2">Dirección: {{ pedido.direccion }}</p>

            <p class="fw-semibold mb-1">Productos del pedido</p>
            <ul class="mb-2 ps-3">
              @for (detalle of (pedido.productos ?? []); track $index) {
                <li>{{ detalle.cantidad }} × {{ detalle.producto }}</li>
              } @empty {
                <li class="text-body-secondary">Detalle de productos no disponible.</li>
              }
            </ul>

            <p class="mb-2">Total: S/ {{ pedido.total.toFixed(2) }}</p>

            <label class="form-label" [attr.for]="'estado-' + pedido.idPedido">
              Estado
            </label>
            <div class="d-flex gap-2">
              <select #estado class="form-select"
                      [id]="'estado-' + pedido.idPedido"
                      [disabled]="guardandoId === pedido.idPedido">
                @for (opcion of estados; track opcion.valor) {
                  <option [value]="opcion.valor"
                          [selected]="opcion.valor === pedido.estado">
                    {{ opcion.texto }}
                  </option>
                }
              </select>

              <button type="button" class="btn btn-success"
                      [disabled]="guardandoId !== null"
                      (click)="cambiarEstado(pedido, estado.value)">
                {{ guardandoId === pedido.idPedido ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </article>
        } @empty {
          @if (!error) {
            @if (fechaSeleccionada) {
              <p role="status">No hay pedidos que coincidan con los filtros seleccionados.</p>
            } @else if (numeroBuscado) {
              <p>No encontramos el pedido #{{ numeroBuscado }}.</p>
            } @else {
              <p>Todavía no hay pedidos.</p>
            }
          }
        }
      }
    </section>
  `
})
export class AdminPedidosComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly route = inject(ActivatedRoute);

  pedidos: PedidoHistorial[] = [];
  fechaSeleccionada = '';
  cargando = true;
  guardandoId: number | null = null;
  error = '';

  readonly estados = [
    { valor: 'EN_LOCAL', texto: 'En preparación' },
    { valor: 'EN_CAMINO', texto: 'En camino' },
    { valor: 'RECIBIDO', texto: 'Entregado' },
    { valor: 'CANCELADO', texto: 'Cancelado' }
  ];

  get numeroBuscado(): string | null {
    return this.route.snapshot.queryParamMap.get('pedido');
  }

  get pedidosVisibles(): PedidoHistorial[] {
    const numero = this.numeroBuscado;

    return this.pedidos.filter(pedido =>
      (!numero || pedido.idPedido === Number(numero)) &&
      (!this.fechaSeleccionada || pedido.fecha?.slice(0, 10) === this.fechaSeleccionada)
    );
  }

  ngOnInit(): void {
    this.pedidoService.listarTodos().subscribe({
      next: pedidos => {
        this.pedidos = pedidos;
        this.cargando = false;
      },
      error: respuesta => {
        this.cargando = false;
        this.error = this.mensajeError(respuesta.status, 'No se pudieron cargar los pedidos.');
      }
    });
  }

  cambiarEstado(pedido: PedidoHistorial, estado: string): void {
    if (estado === pedido.estado || this.guardandoId !== null) {
      return;
    }

    this.error = '';
    this.guardandoId = pedido.idPedido;

    this.pedidoService.actualizarEstado(pedido.idPedido, estado).subscribe({
      next: actualizado => {
        this.pedidos = this.pedidos.map(actual =>
          actual.idPedido === actualizado.idPedido ? actualizado : actual
        );
        this.guardandoId = null;
      },
      error: respuesta => {
        this.guardandoId = null;
        this.error = this.mensajeError(respuesta.status, 'No se pudo guardar el estado.');
      }
    });
  }

  imprimirTicket(pedido: PedidoHistorial): void {
    const ventana = window.open('', '_blank', 'popup,width=420,height=600');

    if (!ventana) {
      this.error = 'Permite las ventanas emergentes para imprimir el ticket.';
      return;
    }

    ventana.opener = null;

    const estado = this.estados.find(opcion => opcion.valor === pedido.estado)
      ?.texto ?? pedido.estado;

    const documento = ventana.document;
    documento.documentElement.lang = 'es';
    documento.title = `Ticket del pedido ${pedido.idPedido}`;

    const estilos = documento.createElement('style');
    estilos.textContent = `
      @page {
        margin: 4mm;
      }

      body {
        margin: 0;
        color: #111;
        background: #fff;
        font: 12px/1.5 monospace;
      }

      main {
        box-sizing: border-box;
        width: 100%;
        max-width: 72mm;
        margin: 0 auto;
        padding: 3mm;
      }

      h1, h2 {
        margin: 0;
        text-align: center;
      }

      h1 {
        font-size: 18px;
      }

      h2 {
        font-size: 14px;
      }

      p {
        margin: 6px 0;
        overflow-wrap: anywhere;
      }

      hr {
        margin: 10px 0;
        border: 0;
        border-top: 1px dashed #333;
      }

      .total {
        font-size: 15px;
        font-weight: bold;
        text-align: right;
      }
    `;
    documento.head.append(estilos);

    const ticket = documento.createElement('main');

    const marca = documento.createElement('h1');
    marca.textContent = 'El Batán';

    const titulo = documento.createElement('h2');
    titulo.textContent = `Ticket de pedido #${pedido.idPedido}`;

    ticket.append(marca, titulo, documento.createElement('hr'));

    for (const linea of [
      `Cliente: ${pedido.cliente}`,
      `Dirección: ${pedido.direccion}`,
      `Estado: ${estado}`
    ]) {
      const parrafo = documento.createElement('p');
      parrafo.textContent = linea;
      ticket.append(parrafo);
    }

    const tituloProductos = documento.createElement('p');
    tituloProductos.textContent = 'PRODUCTOS DEL PEDIDO';
    tituloProductos.style.fontWeight = 'bold';
    ticket.append(documento.createElement('hr'), tituloProductos);

    const productos = pedido.productos ?? [];

    if (productos.length === 0) {
      const aviso = documento.createElement('p');
      aviso.textContent = 'Detalle de productos no disponible.';
      ticket.append(aviso);
    }

    for (const detalle of productos) {
      const linea = documento.createElement('p');
      linea.textContent = `${detalle.cantidad} × ${detalle.producto}`;
      ticket.append(linea);
    }

    const total = documento.createElement('p');
    total.className = 'total';
    total.textContent = `TOTAL: S/ ${pedido.total.toFixed(2)}`;

    ticket.append(documento.createElement('hr'), total);
    documento.body.replaceChildren(ticket);

    ventana.focus();
    ventana.print();
  }

  private mensajeError(status: number, mensaje: string): string {
    if (status === 401) return 'Vuelve a iniciar sesión.';
    if (status === 403) return 'Esta pantalla requiere una cuenta administradora.';
    return mensaje;
  }
}