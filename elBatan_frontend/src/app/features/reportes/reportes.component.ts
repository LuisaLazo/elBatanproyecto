
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../core/services/reporte.service';
import { ReporteVentaDTO } from '../../core/Interfaces/reporte-venta.interface';
import { ResumenVentasDTO } from '../../core/Interfaces/resumen-ventas.interface';
import { PedidoService } from '../../core/services/pedido.service';
import { AlertService } from '../../core/services/alert.service';
import { ParticipacionProductoDTO } from '../../core/Interfaces/participacion-producto';
import { ReporteUsuarioDTO } from '../../core/Interfaces/reporte-usuario.interface';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {

  ngOnInit(): void {
  this.cargar();
  this.cargarResumen();
  this.cargarParticipacionProductos();
  this.cargarUsuarios();
}

  private reporteService = inject(ReporteService);

  ventas: ReporteVentaDTO[] = [];
  cargando = false;
  error = '';
  busqueda = '';

  fechaInicio: string = '2026-11-01';
  fechaFin: string = '2026-11-30';

  resumen: ResumenVentasDTO = {
    total: 0,
    cantidad: 0
  };

  cargandoResumen = false;
  errorResumen = '';

  usuariosReporte: ReporteUsuarioDTO[] = [];

  cargandoUsuarios = false;
  errorUsuarios = '';
  busquedaUsuarios = '';

  cargar(): void {
    this.cargando = true;
    this.error = '';

    this.reporteService.listarVentas().subscribe({
      next: (datos) => {
        this.ventas = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando reportes:', err);
        this.error = 'No se pudo cargar el reporte de ventas.';
        this.cargando = false;
      }
    });
  }

  get filtradas(): ReporteVentaDTO[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.ventas.filter(v =>
      !texto ||
      [v.cliente, v.producto, v.estado, v.direccion]
        .some(x => (x || '').toLowerCase().includes(texto))
    );
  }

  get total(): number {
    return this.filtradas.reduce(
      (suma, v) => suma + Number(v.subtotal || 0), 0
    );
  }

  get cantidad(): number {
    return this.filtradas.reduce(
      (suma, v) => suma + Number(v.cantidad || 0), 0
    );
  }

  cargarResumen(): void {

    if (!this.fechaInicio || !this.fechaFin) {
      this.errorResumen = 'Selecciona ambas fechas.';
      return;
    }

    if (this.fechaInicio > this.fechaFin) {
      this.errorResumen =
        'La fecha inicial no puede ser posterior a la final.';
      return;
    }

    this.cargandoResumen = true;
    this.errorResumen = '';

    this.reporteService.obtenerResumen(
      this.fechaInicio,
      this.fechaFin
    ).subscribe({
      next: (datos) => {
        this.resumen = datos;
        this.cargandoResumen = false;
      },
      error: (err) => {
        console.error('Error obteniendo resumen:', err);
        this.errorResumen = 'No se pudo obtener el resumen.';
        this.cargandoResumen = false;
      }
    });
  }


  private pedidoService = inject(PedidoService);
  private alertService = inject(AlertService);

  estados: string[] = [
    'EN_LOCAL',
    'EN_CAMINO',
    'RECIBIDO',
    'CANCELADO'
  ];

  cambiandoEstado: number | null = null;

  cambiarEstado(idPedido: number, nuevoEstado: string): void {

    this.cambiandoEstado = idPedido;

    this.pedidoService.actualizarEstado(
      idPedido,
      nuevoEstado
    ).subscribe({
      next: () => {
        this.alertService.success(
          'Estado actualizado correctamente'
        );

        this.cambiandoEstado = null;

        // Actualizar la tabla desde Oracle
        this.cargar();
      },
      error: (err) => {
        console.error('Error actualizando estado:', err);

        this.alertService.error(
          'No se pudo actualizar el estado'
        );

        this.cambiandoEstado = null;
        this.cargar();
      }
    });
  }

  //reporte participación productos

  participacionProductos: ParticipacionProductoDTO[] = [];

  cargandoParticipacion = false;
  errorParticipacion = '';

  get ingresosProductos(): number {
    return this.participacionProductos.reduce(
      (total, producto) =>
        total + producto.ingresosGenerados,
      0
    );
  }

  get unidadesProductos(): number {
    return this.participacionProductos.reduce(
      (total, producto) =>
        total + producto.unidadesVendidas,
      0
    );
  }

  get cantidadProductosVendidos(): number {
    return this.participacionProductos.length;
  }

  cargarParticipacionProductos(): void {
    this.cargandoParticipacion = true;
    this.errorParticipacion = '';

    this.reporteService.obtenerParticipacionProductos()
      .subscribe({
        next: (datos) => {
          this.participacionProductos = datos;
          this.cargandoParticipacion = false;
        },
        error: (error) => {
          console.error(
            'Error al obtener participación de productos:',
            error
          );

          this.errorParticipacion =
            'No se pudo cargar la participación de productos.';

          this.cargandoParticipacion = false;
        }
      });
  }


  cargarUsuarios(): void {
    this.cargandoUsuarios = true;
    this.errorUsuarios = '';

    this.reporteService.listarUsuarios().subscribe({
      next: (datos) => {
        this.usuariosReporte = datos;
        this.cargandoUsuarios = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.errorUsuarios =
          'No se pudo cargar el reporte de usuarios.';
        this.cargandoUsuarios = false;
      }
    });
  }


get usuariosFiltrados(): ReporteUsuarioDTO[] {

  const texto = this.busquedaUsuarios.trim().toLowerCase();

  return this.usuariosReporte.filter(u =>
    !texto ||
    [
      u.nombre,
      u.usuario,
      u.rol
    ].some(valor =>
      (valor || '').toLowerCase().includes(texto)
    )
  );
}

get totalUsuarios(): number {
  return this.usuariosReporte.length;
}


}
