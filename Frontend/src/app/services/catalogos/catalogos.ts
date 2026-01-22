import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class Catalogos {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getCatalogos(cat_tipo: string): Observable<any> {
   
    return this.http.get(this.apiUrl + '/catalogos/' + cat_tipo)
    .pipe(catchError((error: HttpErrorResponse) => {return throwError(() => error);}));
  };

  getCatalogoUT(id: number): Observable<any> {

    const params = new HttpParams()
      .set('id', id)

    return this.http.get(this.apiUrl + '/catalogos/cat_unidadTerritorial', {params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  getClaveUT(id: number): Observable<any> {
 
    const params = new HttpParams()
      .set('id', id)

    return this.http.get(this.apiUrl + '/catalogos/getClaveUT', {params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  getSegundaCategoria(id: number): Observable<any> {

    const params = new HttpParams()
      .set('id', id)

    return this.http.get(this.apiUrl + '/catalogos/getSegundaCategoria', {params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  getTercerCategoria(id: number): Observable<any> {

    const params = new HttpParams()
      .set('id', id)

    return this.http.get(this.apiUrl + '/catalogos/getTercerCategoria', {params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }
}