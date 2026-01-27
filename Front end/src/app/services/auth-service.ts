// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { sha256 } from 'js-sha256';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private router: Router) {}

  login(correo_electronico: string, password: string, captchaToken: string): Observable<any> {

    const hashedPassword = sha256(password);

    const body = {
      correo_electronico,
      password: hashedPassword,
      captchaToken   
    };

    return this.http.post(this.apiUrl + '/login/login', body);
  } 

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tipo_usuario');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  cerrarSesionByToken() {
    this.router.navigate(['']);
  }

  updateVideoData(token: string, id: number): Observable<any> {
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.patch(`${this.apiUrl}/muro/updateMuro`, {id_usuario: id}, { headers });
  }
}