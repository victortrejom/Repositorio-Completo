import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})

export class Publico {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getAlcaldias(): Observable<any> {
    return this.http.get(this.apiUrl + '/publico/alcaldiasPub')
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  };

  getUnidadTerritorial(): Observable<any> {

    return this.http.get(this.apiUrl + '/publico/unidadPub')
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  };

  descargarCategorias(nombreFisico: string): Observable<Blob> {
    const headers = new HttpHeaders({
    });

    return this.http.get(`${this.apiUrl}/descargas/downloadCategoria/${nombreFisico}`, {
      headers,
      responseType: 'blob'
    }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
}