import { Component, inject, OnInit } from '@angular/core';
import {
  PedidoHistorial,
  PedidoService
} from '../../core/services/pedido.service';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  template: `
    <section class="container pedidos-page" aria-labelledby="pedidos-titulo">
      <header class="pedidos-header">
        <h1 id="pedidos-titulo">Mis pedidos</h1>
      </header>

      <div class="pedidos-toolbar">
        <div class="pedido-busqueda">
          <label for="buscarMiPedido" class="form-label">
            Buscar por código de pedido
          </label>
          <div class="input-group">
            <span class="input-group-text bg-white" aria-hidden="true">
              <i class="bi bi-search"></i>
            </span>
            <input #buscador id="buscarMiPedido" type="search"
                   class="form-control" placeholder="Ej. BAT-23"
                   (input)="codigoBuscado = buscador.value.trim().toUpperCase()">
          </div>
        </div>

        <div class="pedido-busqueda">
          <label for="fechaMiPedido" class="form-label">Fecha del pedido</label>
          <div class="input-group">
            <input #calendario id="fechaMiPedido" type="date"
                   class="form-control" [value]="fechaSeleccionada"
                   (change)="fechaSeleccionada = calendario.value">
            <button type="button" class="btn btn-outline-secondary"
                    [disabled]="!fechaSeleccionada"
                    (click)="fechaSeleccionada = ''">
              Limpiar fecha
            </button>
          </div>
        </div>

        <button type="button" class="btn btn-actualizar"
                [disabled]="cargando" (click)="cargarPedidos()">
          <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
          {{ cargando ? 'Actualizando…' : 'Actualizar' }}
        </button>
      </div>

      @if (cargando) {
        <p class="pedido-mensaje" role="status">Cargando pedidos…</p>
      } @else if (error) {
        <p class="alert alert-warning" role="alert">{{ error }}</p>
      } @else {
        <div class="pedidos-grid">
          @for (pedido of pedidosFiltrados; track pedido.idPedido) {
            <article class="pedido-card">
              <div class="pedido-card-header">
                <h2>Pedido {{ pedido.codigoPedido }}</h2>
                <span class="pedido-estado" [attr.data-estado]="pedido.estado">
                  {{ estados[pedido.estado] ?? pedido.estado }}
                </span>
              </div>

              @if (pedido.fecha; as fecha) {
                <p class="small text-body-secondary mt-2 mb-0">
                  Fecha: {{ fecha.slice(8, 10) }}/{{ fecha.slice(5, 7) }}/{{ fecha.slice(0, 4) }}
                </p>
              }

              <div class="mt-3">
                <p class="fw-semibold mb-1">Productos del pedido</p>

                <ul class="mb-0 ps-3">
                  @for (detalle of (pedido.productos ?? []); track $index) {
                    <li>{{ detalle.cantidad }} × {{ detalle.producto }}</li>
                  } @empty {
                    <li class="text-body-secondary">Detalle de productos no disponible.</li>
                  }
                </ul>
              </div>

              <dl class="pedido-datos">
                <div>
                  <dt>Dirección de entrega</dt>
                  <dd>{{ pedido.direccion }}</dd>
                </div>
                <div class="pedido-total">
                  <dt>Total</dt>
                  <dd>S/ {{ pedido.total.toFixed(2) }}</dd>
                </div>
              </dl>
            </article>
          } @empty {
            <p class="pedido-mensaje" role="status">
              {{ (codigoBuscado || fechaSeleccionada)
                ? 'No hay pedidos que coincidan con los filtros.'
                : 'Todavía no tienes pedidos.' }}
            </p>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .pedidos-page {
      --verde-batan: #2e5337;
      --borde: #e3e1d8;
      max-width: 1100px;
      padding-top: clamp(1.25rem, 4vw, 3rem);
      padding-bottom: 3rem;
    }

    .pedidos-header {
      padding: clamp(1.25rem, 4vw, 2.25rem);
      border-radius: 1rem;
      background: var(--verde-batan);
      color: #fff;
    }

    .pedidos-header h1 {
      margin: 0;
      font-size: clamp(1.8rem, 4vw, 2.6rem);
      font-weight: 700;
    }

    .pedidos-toolbar,
    .pedido-card,
    .pedido-mensaje {
      padding: 1.15rem;
      border: 1px solid var(--borde);
      border-radius: .875rem;
      background: #fff;
    }

    .pedidos-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
      margin: 1rem 0;
    }

    .pedido-busqueda {
      flex: 1 1 15rem;
      min-width: 0;
      max-width: 22rem;
    }

    .pedido-busqueda label {
      font-weight: 600;
    }

    .btn-actualizar {
      --bs-btn-color: var(--verde-batan);
      --bs-btn-border-color: var(--verde-batan);
      --bs-btn-hover-color: #fff;
      --bs-btn-hover-bg: var(--verde-batan);
      --bs-btn-hover-border-color: var(--verde-batan);
      --bs-btn-disabled-color: var(--verde-batan);
      --bs-btn-disabled-border-color: var(--verde-batan);
    }

    .pedidos-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .pedido-card-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: .5rem;
      padding-bottom: .85rem;
      border-bottom: 1px solid var(--borde);
    }

    .pedido-card h2 {
      margin: 0;
      color: var(--verde-batan);
      font-size: 1.1rem;
      font-weight: 700;
    }

    .pedido-estado {
      padding: .3rem .65rem;
      border-radius: 999px;
      background: #efefeb;
      color: #494c46;
      font-size: .8rem;
      font-weight: 600;
    }

    .pedido-estado[data-estado="EN_LOCAL"] {
      background: #fff2d7;
      color: #754700;
    }

    .pedido-estado[data-estado="EN_CAMINO"] {
      background: #e7efff;
      color: #224c92;
    }

    .pedido-estado[data-estado="RECIBIDO"] {
      background: #e5f2e6;
      color: #25532e;
    }

    .pedido-estado[data-estado="CANCELADO"] {
      background: #fbe7e5;
      color: #912f27;
    }

    .pedido-datos {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
      gap: .75rem;
      margin: .85rem 0 0;
    }

    .pedido-datos dt {
      margin-bottom: .2rem;
      color: #555e54;
      font-size: .8rem;
    }

    .pedido-datos dd {
      margin: 0;
      overflow-wrap: anywhere;
    }

    .pedido-total {
      text-align: right;
    }

    .pedido-total dd {
      color: var(--verde-batan);
      font-size: 1.1rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .pedido-mensaje {
      grid-column: 1 / -1;
      margin: 0;
    }

    @media (max-width: 767px) {
      .pedidos-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    @media (max-width: 480px) {
      .pedido-busqueda,
      .btn-actualizar {
        flex-basis: 100%;
        max-width: none;
      }
    }
  `]
})
export class MisPedidosComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);

  pedidos: PedidoHistorial[] = [];
  codigoBuscado = '';
  fechaSeleccionada = '';
  cargando = false;
  error = '';

  readonly estados: Record<string, string> = {
    EN_LOCAL: 'En preparación',
    EN_CAMINO: 'En camino',
    RECIBIDO: 'Entregado',
    CANCELADO: 'Cancelado'
  };

  get pedidosFiltrados(): PedidoHistorial[] {
    const { codigoBuscado, fechaSeleccionada } = this;

    return this.pedidos.filter(pedido => {
      const coincideCodigo =
        !codigoBuscado || pedido.codigoPedido === codigoBuscado;
      const coincideFecha =
        !fechaSeleccionada || pedido.fecha?.slice(0, 10) === fechaSeleccionada;

      return coincideCodigo && coincideFecha;
    });
  }

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.error = '';

    this.pedidoService.listarMisPedidos().subscribe({
      next: pedidos => {
        this.pedidos = pedidos;
        this.cargando = false;
      },
      error: respuesta => {
        this.cargando = false;
        this.error = respuesta.status === 401
          ? 'Vuelve a iniciar sesión para consultar tus pedidos.'
          : 'No se pudieron cargar tus pedidos. Intenta actualizar.';
      }
    });
  }
}