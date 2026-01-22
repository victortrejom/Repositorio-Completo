import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-aviso-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './aviso-home.html',
  styleUrl: './aviso-home.css',
})
export class AvisoHome {


  activarBoton() {
    const check = (document.getElementById('privacidad') as HTMLInputElement).checked;
    const btnAceptar = document.getElementById('btnAceptar') as HTMLButtonElement;
    btnAceptar.disabled = !check;
  }

  aceptarAviso() {
    sessionStorage.setItem('avisoPendiente', 'false');
  }



  

}
