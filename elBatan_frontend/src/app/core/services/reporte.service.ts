
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ReporteVentaDTO } from '../Interfaces/reporte-venta.interface';
import { ResumenVentasDTO } from '../Interfaces/resumen-ventas.interface';
import { ParticipacionProductoDTO } from '../Interfaces/participacion-producto';
import { ReporteUsuarioDTO } from '../Interfaces/reporte-usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private http = inject(HttpClient);

  private apiUrl = '/elBatan/api/v1/reportes';

  listarVentas(): Observable<ReporteVentaDTO[]> {
    return this.http.get<ReporteVentaDTO[]>(
      `${this.apiUrl}/ventas`
    );
  }

  obtenerResumen(
    inicio: string,
    fin: string
  ): Observable<ResumenVentasDTO> {

    return this.http.get<ResumenVentasDTO>(
      `${this.apiUrl}/resumen`,
      {
        params: { inicio, fin }
      }
    );
  }

  obtenerParticipacionProductos():
    Observable<ParticipacionProductoDTO[]> {

    return this.http.get<ParticipacionProductoDTO[]>(
      `${this.apiUrl}/participacion-productos`
    );
  }

  listarUsuarios(): Observable<ReporteUsuarioDTO[]> {
    return this.http.get<ReporteUsuarioDTO[]>(
      `${this.apiUrl}/usuarios`
    );
  }
}
