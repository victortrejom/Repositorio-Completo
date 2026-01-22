import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../enviroments/enviroment';


@Injectable({
  providedIn: 'root',
})
export class Necesidades {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  insertaRegistro(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const body = {
      ...data,
    };

    return this.http.post(this.apiUrl + '/necesidades/altaNecesidad', body, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  };

  getSumate(direccion_distrital: number | null, demarcacion_territorial: number | null, 
            unidad_territorial: number | null, id_categoria: number | null, ordenar: number | null): Observable<any> {

    const params = new HttpParams()
      .set('direccion_distrital', direccion_distrital !== null ? direccion_distrital: '')
      .set('demarcacion_territorial', demarcacion_territorial !== null ? demarcacion_territorial: '')
      .set('unidad_territorial', unidad_territorial !== null ? unidad_territorial: '')
      .set('id_categoria', id_categoria !== null ? id_categoria: '')
      .set('ordenar', ordenar !== null ? ordenar: '')
      
    return this.http.get(this.apiUrl + '/necesidades/sumate', {params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  };

  addVoto(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const body = {
      ...data,
    };

    return this.http.post(this.apiUrl + '/necesidades/nuevoVoto', body, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  };

  getAlcaldias(id: number | null, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('id', id !== null ? id: '');
      
    return this.http.get(this.apiUrl + '/consulta/getAlcaldias', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  };

  getAlcaldiasByid(id: number | null, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('id', id !== null ? id: '');
      
    return this.http.get(this.apiUrl + '/consulta/getAlcaldiasById', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  };

  getUnidadTerritorial(id: number | null, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('id', id !== null ? id: '');
      
    return this.http.get(this.apiUrl + '/consulta/getUnidadTerritorial', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  };

  getUnidadTerritorialByid(id: number | null, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('id', id !== null ? id: '');
      
    return this.http.get(this.apiUrl + '/consulta/getUnidadTerritorialById', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  };
  
  getReporte(direccion_distrital:number | null, token: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

     const params = new HttpParams()
      .set('direccion_distrital', direccion_distrital !== null ? direccion_distrital: '');

    return this.http.get(this.apiUrl + '/reporte/reporteGeneral', {
      headers,params,
      responseType: 'blob'
    });
  }

  getRegistro(idNecesidad:number | null): Observable<any> {

    const params = new HttpParams()
      .set('idNecesidad', idNecesidad !== null ? idNecesidad: '')
      
    return this.http.get(this.apiUrl + '/necesidades/getRegistro', {params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  };
}