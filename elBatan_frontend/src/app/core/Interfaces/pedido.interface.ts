export interface ItemVentaDTO {
  idProducto: number;
  cantidad: number;
}

export interface VentaDTO {
  direccion: string;
  referencia: string;
  telefonoEntrega: string;
  items: ItemVentaDTO[];
}