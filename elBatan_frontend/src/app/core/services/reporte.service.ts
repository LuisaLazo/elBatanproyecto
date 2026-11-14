
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ReporteVentaDTO } from '../Interfaces/reporte-venta.interface';
import { ResumenVentasDTO } from '../Interfaces/resumen-ventas.interface';
import { ParticipacionProductoDTO } from '../Interfaces/participacion-producto';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private http = inject(HttpClient);

  listarVentas(): Observable<ReporteVentaDTO[]> {
    return this.http.get<ReporteVentaDTO[]>(
      '/api/v1/reportes/ventas'
    );
  }

  obtenerResumen(
    inicio: string,
    fin: string
  ): Observable<ResumenVentasDTO> {

    return this.http.get<ResumenVentasDTO>(
      '/api/v1/reportes/resumen',
      {
        params: {
          inicio: inicio,
          fin: fin
        }
      }
    );
  }

  obtenerParticipacionProductos(): Observable<ParticipacionProductoDTO[]> {
    return this.http.get<ParticipacionProductoDTO[]>(
      '/api/v1/reportes/participacion-productos'
    );
  }
}
