//para sostener el producto en el carrito

import { Producto } from "./producto.interface";

export interface CartItem{
    producto: Producto;
    cantidad: number
}