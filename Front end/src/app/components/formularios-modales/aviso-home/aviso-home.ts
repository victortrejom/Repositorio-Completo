import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-aviso-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './aviso-home.html',
  styleUrl: './aviso-home.css',
})
export class AvisoHome {

  public isChecked: boolean = false;
  public videoUrl: SafeResourceUrl;
  public mostrarFrame: boolean = false;
  public idUser: string | null = sessionStorage.getItem('usuario');

  constructor(
    private sanitizer: DomSanitizer,
    private sesionVideoService: AuthService 
  ) {
    const videoId = 'L-OfjJUd1ik';
    const url = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  activarBoton(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if(isChecked){
      const btnAceptar = document.getElementById('btnAceptar') as HTMLButtonElement;
      btnAceptar.disabled = false;
    }
  }

  updateVideoSession() {
    const token = this.sesionVideoService.getToken();
    if (token && this.idUser) {
      this.sesionVideoService.updateVideoData(token, Number(this.idUser)).subscribe({
        next: (response) => {
          console.log('Video session updated successfully', response);
        },
        error: (error) => {
          console.error('Error updating video session', error);
        }
      });
    }
  }

  cerrarFrame() {
    this.mostrarFrame = false;
    //Aqui va la logica de los videos
    this.updateVideoSession();
  }

  aceptarAviso() {
    sessionStorage.setItem('avisoPendiente', 'false');    
    if(sessionStorage.getItem('muro') === 'false'){
      this.mostrarFrame = true;  
    }
  }
}