import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class RecuperarPassword {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }
  recuperarPassword(correo: string): Observable<any> {

  const body = { correo };

  return this.http.post(this.apiUrl + '/recuperarPass/recuperar', body)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
}



}
