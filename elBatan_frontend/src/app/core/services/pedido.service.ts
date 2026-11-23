
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { VentaDTO } from '../Interfaces/pedido.interface';

// ==========================================
// RESPUESTA AL CREAR UN PEDIDO
// ==========================================

interface PedidoCreado {
  idPedido: number;
  codigoPedido: string;
}

// ==========================================
// PEDIDOS DEL CLIENTE Y ADMINISTRADOR
// ==========================================

export interface PedidoHistorial {
  idPedido: number;
  codigoPedido: string;
  cliente: string;
  estado: string;
  total: number;
  direccion: string;
  fecha?: string | null;
  productos?: {
    producto: string;
    cantidad: number;
  }[];
}

// ==========================================
// PEDIDOS DEL REPARTIDOR
// ==========================================

export interface PedidoRepartidor {
  idPedido: number;
  codigoPedido: string | null;
  cliente: string;
  total: number;

  estado:
    | 'EN_LOCAL'
    | 'EN_CAMINO'
    | 'RECIBIDO'
    | 'CANCELADO';

  fecha: string | null;
  direccion: string | null;
  referencia: string | null;
  telefonoEntrega: string | null;

  productos: {
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];

  idRepartidor: number | null;
  nombreRepartidor: string | null;
  evidenciaEntrega: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private readonly http = inject(HttpClient);

  private readonly rutaPedidos =
    '/elBatan/api/v1/pedidos';

  // ==========================================
  // CLIENTE: CREAR PEDIDO
  // ==========================================

  crearPedido(datos: VentaDTO) {
    return this.http.post<PedidoCreado>(
      this.rutaPedidos,
      datos
    );
  }

  // ==========================================
  // CLIENTE: CONSULTAR MIS PEDIDOS
  // ==========================================

  listarMisPedidos() {
    return this.http.get<PedidoHistorial[]>(
      `${this.rutaPedidos}/mios`
    );
  }

  // ==========================================
  // ADMIN: LISTAR TODOS LOS PEDIDOS
  // ==========================================

  listarTodos() {
    return this.http.get<PedidoHistorial[]>(
      this.rutaPedidos
    );
  }

  // ==========================================
  // ADMIN: ACTUALIZAR ESTADO
  // ==========================================

  actualizarEstado(idPedido: number, estado: string) {
    return this.http.put<PedidoHistorial>(
      `${this.rutaPedidos}/${idPedido}/estado`,
      null,
      {
        params: { estado }
      }
    );
  }

  // ==========================================
  // REPARTIDOR: PEDIDOS DISPONIBLES
  // ==========================================

  listarDisponibles() {
    return this.http.get<PedidoRepartidor[]>(
      `${this.rutaPedidos}/disponibles`
    );
  }

  // ==========================================
  // REPARTIDOR: MIS ENTREGAS
  // ==========================================

  listarMisEntregas() {
    return this.http.get<PedidoRepartidor[]>(
      `${this.rutaPedidos}/mis-entregas`
    );
  }

  // ==========================================
  // REPARTIDOR: TOMAR PEDIDO
  // ==========================================

  tomarPedido(idPedido: number) {
    return this.http.put<PedidoRepartidor>(
      `${this.rutaPedidos}/${idPedido}/tomar`,
      null
    );
  }

  // ==========================================
  // REPARTIDOR: CONFIRMAR ENTREGA CON FOTO
  // ==========================================

  confirmarEntrega(idPedido: number, archivo: File) {

    const formData = new FormData();

    formData.append('archivo', archivo);

    return this.http.post<PedidoRepartidor>(
      `${this.rutaPedidos}/${idPedido}/evidencia`,
      formData
    );
  }

  // ==========================================
  // REPARTIDOR: VISUALIZAR EVIDENCIA
  // ==========================================

  obtenerEvidencia(idPedido: number) {
    return this.http.get(
      `${this.rutaPedidos}/${idPedido}/evidencia`,
      {
        responseType: 'blob'
      }
    );
  }
}
