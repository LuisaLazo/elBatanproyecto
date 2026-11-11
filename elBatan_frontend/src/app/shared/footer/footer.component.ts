import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  readonly anio = new Date().getFullYear();

  // Completar con los enlaces oficiales de El Batán cuando el restaurante los proporcione.
  readonly redesSociales: { nombre: string; url: string; icono: string }[] = [];
  readonly libroReclamacionesUrl = '';
}
