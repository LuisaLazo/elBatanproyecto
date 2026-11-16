import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { VentaDTO } from '../Interfaces/pedido.interface';

interface PedidoCreado {
  idPedido: number;
}

export interface PedidoHistorial {
  idPedido: number;
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

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly rutaPedidos = '/elBatan/api/v1/pedidos';

  crearPedido(datos: VentaDTO) {
    return this.http.post<PedidoCreado>(this.rutaPedidos, datos);
  }

  listarMisPedidos() {
    return this.http.get<PedidoHistorial[]>(`${this.rutaPedidos}/mios`);
  }

  listarTodos() {
    return this.http.get<PedidoHistorial[]>(this.rutaPedidos);
  }

  actualizarEstado(idPedido: number, estado: string) {
    return this.http.put<PedidoHistorial>(
      `${this.rutaPedidos}/${idPedido}/estado`,
      null,
      { params: { estado } }
    );
  }
}