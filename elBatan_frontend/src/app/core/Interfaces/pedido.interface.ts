
//para enviar

export interface ItemVentaDTO{
    idProducto:number;
    cantidad : number;
}

//Pedido
export interface VentaDTO{
idPersona:number;
items: ItemVentaDTO[];

}