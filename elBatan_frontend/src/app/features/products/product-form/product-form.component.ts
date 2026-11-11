import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { finalize } from 'rxjs';

import { ProductoService } from '../../../core/services/producto.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  private fotoUrl: string | null = null;

  id: number | null = null;
  fotoSeleccionada: File | null = null;
  vistaPrevia = '';
  errorFoto = '';
  cargando = false;
  cargaFallida = false;
  guardando = false;

  form = this.fb.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255)
      ]
    ],
    descripcion: ['', Validators.maxLength(255)],
    precio: [0, [Validators.required, Validators.min(0.1)]],
    stock: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(2147483647),
        Validators.pattern(/^\d+$/)
      ]
    ]
  });

  ngOnInit(): void {
    const idRuta = this.route.snapshot.paramMap.get('id');
    this.id = idRuta ? Number(idRuta) : null;

    if (this.id) {
      this.cargarProducto();
    }
  }

  cargarProducto(): void {
    if (!this.id) return;

    this.cargando = true;
    this.cargaFallida = false;

    this.productoService.getProductoById(this.id).pipe(
      finalize(() => this.cargando = false)
    ).subscribe({
      next: producto => {
        this.form.patchValue(producto);
        this.vistaPrevia = producto.imagen || '';
      },
      error: () => {
        this.cargaFallida = true;
      }
    });
  }

  onFileSelected(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.errorFoto = 'Selecciona un archivo de imagen.';
      input.value = '';
      return;
    }

    if (this.fotoUrl) {
      URL.revokeObjectURL(this.fotoUrl);
    }

    this.fotoSeleccionada = archivo;
    this.fotoUrl = URL.createObjectURL(archivo);
    this.vistaPrevia = this.fotoUrl;
    this.errorFoto = '';
  }

  guardar(): void {
    if (
      this.guardando ||
      this.cargando ||
      this.cargaFallida ||
      this.errorFoto
    ) {
      return;
    }

    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const valores = this.form.getRawValue();
    const datos = new FormData();

    datos.append('nombre', valores.nombre || '');
    datos.append('descripcion', valores.descripcion || '');
    datos.append('precio', String(valores.precio));
    datos.append('stock', String(valores.stock));

    if (this.fotoSeleccionada) {
      datos.append('file', this.fotoSeleccionada);
    }

    this.guardando = true;

    const solicitud = this.id
      ? this.productoService.updateProduct(this.id, datos)
      : this.productoService.createProduct(datos);

    solicitud.pipe(
      finalize(() => this.guardando = false)
    ).subscribe({
      next: () => {
        this.alertService.success(
          this.id ? 'Producto actualizado' : 'Producto creado'
        );

        this.router.navigate(['/productos']);
      },
      error: () => {
        this.alertService.error(
          'No se pudo guardar. Revisa la conexión y vuelve a intentarlo.'
        );
      }
    });
  }

  ngOnDestroy(): void {
    if (this.fotoUrl) {
      URL.revokeObjectURL(this.fotoUrl);
    }
  }
}