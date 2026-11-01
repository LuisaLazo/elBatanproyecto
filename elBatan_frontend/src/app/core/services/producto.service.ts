import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../Interfaces/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  //usamos la ruta del backend
  private apiUrl = '/api/v1/productos';

  //(Lista) ruta pública que no necesita un token
  getProductos():Observable<Producto[]>{
    return this.http.get<Producto[]>(this.apiUrl);
  }
  //obtener por ID (lista)
  getProductoById(id:number) : Observable<Producto>{
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  //PARA EL ADMIN
  createProduct(formData: FormData):Observable<Producto>{
    console.log("Form data recibido create");
    formData.forEach((value,key)=>{
      console.log(`${key}:`,value);

    })
    return this.http.post<Producto>(this.apiUrl,formData);
  }

  updateProduct(id:number, formData: FormData):Observable<Producto>{
    console.log("Form data recibido update");
    formData.forEach((value,key)=>{
      console.log(`${key}:`,value);

    })
    return this.http.put<Producto>(`${this.apiUrl}/${id}`,formData);
  }

  deleteProduct(id:number):Observable<void>{
    console.log("Id del producto a eliminar", id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}
