
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';

import { Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';

import { LoginComponent } from '../../../features/login/login.component';
import { RegistroComponent } from '../../../features/registro/registro.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    RegistroComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('acceso')
  dialogoAcceso!: ElementRef<HTMLDialogElement>;

  vistaAcceso: 'login' | 'registro' | null = null;

  constructor() {

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {

        if (!this.dialogoAcceso) {
          return;
        }

        this.verificarAcceso();
      });
  }

  // ======================================
  // ABRIR MODAL
  // ======================================

  abrirModal(dialogo: HTMLDialogElement): void {

    if (dialogo.open) {
      return;
    }

    this.vistaAcceso = 'login';

    dialogo.showModal();
  }

  // ======================================
  // ABRIR LOGIN DESDE UNA REDIRECCIÓN
  // ======================================

  verificarAcceso(): void {

    const url = this.router.parseUrl(this.router.url);

    const acceso = url.queryParams['acceso'];

    if (acceso === 'login') {

      this.abrirModal(this.dialogoAcceso.nativeElement);

      // Quitar el parámetro después de abrir el modal
      this.router.navigate([], {
        queryParams: { acceso: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }

  ngAfterViewInit(): void {
    this.verificarAcceso();
  }
}
