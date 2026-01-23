import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-preguntas-frecuentes',
  imports: [],
  templateUrl: './preguntas-frecuentes.html',
  styleUrl: './preguntas-frecuentes.css',
})
export class PreguntasFrecuentes {
  public directorioIecm = `${environment.directorioIecm}`;
  
  constructor(private location: Location) {}

usuSistema() {
  const destino = document.getElementById('usoSistema');

  if (destino) {
    destino.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

sobreNecesidad(){
  const destino = document.getElementById('sobreNecesidad');

  if (destino) {
    destino.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

siguientesPasos(){
  const destino = document.getElementById('siguientesPasos');

  if (destino) {
    destino.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

participativo(){
  const destino = document.getElementById('participativo');

  if (destino) {
    destino.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

  regresar() {
    this.location.back(); // Esto regresa a la página anterior
  }


}
