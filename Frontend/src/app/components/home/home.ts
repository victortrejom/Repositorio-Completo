import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Modal } from 'bootstrap';
import { AvisoHome } from '../formularios-modales/aviso-home/aviso-home';
import { NuevaNecesidadComponent } from '../formularios-modales/nueva-necesidad/nueva-necesidad';
import { CommonModule } from '@angular/common';
import { SumateNecesidad } from '../formularios-modales/sumate-necesidad/sumate-necesidad';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, AvisoHome, CommonModule, NuevaNecesidadComponent , SumateNecesidad],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  
  tokenSesion: string = '';
  showModal = false;
  showModalSumate = false;

  ngOnInit() {
    this.tokenSesion = sessionStorage.getItem('token')!;
    const pendiente = sessionStorage.getItem('avisoPendiente');

    if (pendiente === 'true') {
      this.modalAviso();
    }
  }

  modalAviso() {
    const modalElement = document.getElementById('modalAvisoHome');
    if (modalElement) {
      const modal = new Modal(modalElement, {
        backdrop: 'static', 
        keyboard: false     
      });
      modal.show();
    }
  }

  openModal() {
      this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  
  openModalSumate() {
      this.showModalSumate = true;
  }

  closeModalSumate() {
    this.showModalSumate = false;
  }

  currentBanner = 1;

  nextBanner() {
    this.currentBanner = 2;
  }

  prevBanner() {
    this.currentBanner = 1;
  }
}
