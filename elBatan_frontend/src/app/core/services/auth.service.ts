import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface LoginResponse {
  token: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sesionActiva = new BehaviorSubject<boolean>(
    Boolean(localStorage.getItem('elBatan.token'))
  );

  readonly isLoggedIn$ = this.sesionActiva.asObservable();

  login(credenciales: { usuario: string; password: string }) {
    return this.http.post<LoginResponse>(
      '/elBatan/api/v1/auth/login',
      credenciales
    );
  }

  iniciarSesion(token: string, roles: string[]): void {
    localStorage.setItem('elBatan.token', token);
    localStorage.setItem('elBatan.roles', roles.join(','));
    this.sesionActiva.next(true);
  }

  cerrarSesion(): void {
    localStorage.removeItem('elBatan.token');
    localStorage.removeItem('elBatan.roles');
    this.sesionActiva.next(false);
  }
}