import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class RegistroUsuarios {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

   guardar(data: any): Observable<any> {

    return this.http.post(this.apiUrl + '/registro/nuevo', data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  };
  
    // Método para guardar datos
  guardar2(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }

}
