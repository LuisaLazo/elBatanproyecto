import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { VentaDTO } from '../Interfaces/pedido.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private http = inject(HttpClient);
  private apiUrl = '/api/v1/pedidos';

  crearPedido(venta: VentaDTO): Observable<any> {
    return this.http.post<any>(this.apiUrl, venta);
  }

  actualizarEstado(idPedido: number, estado: string) {
  return this.http.put(
    `${this.apiUrl}/${idPedido}/estado`,
    null,
    {
      params: { estado }
    }
  );
}

}