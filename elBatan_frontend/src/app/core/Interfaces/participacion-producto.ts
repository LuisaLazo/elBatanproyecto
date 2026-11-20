
export interface ParticipacionProductoDTO {
  idProducto: number;
  producto: string;
  precio: number;
  stockActual: number;
  pedidosRealizados: number;
  unidadesVendidas: number;
  ingresosGenerados: number;
  porcentajeParticipacion: number;
}
