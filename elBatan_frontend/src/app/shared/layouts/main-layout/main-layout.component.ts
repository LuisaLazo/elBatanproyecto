import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  vistaAcceso: 'login' | 'registro' | null = null;

  abrirModal(dialogo: HTMLDialogElement): void {
    if (dialogo.open) return;

    this.vistaAcceso = 'login';
    dialogo.showModal();
  }
}