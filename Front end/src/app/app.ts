import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Modal } from 'bootstrap';
import { RecuperarContrasena } from './components/formularios-modales/recuperar-contrasena/recuperar-contrasena';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RecuperarContrasena],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('repositorio-ciudadana-front');


  showRecuperar = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showRecuperar = event.url === '/login' || event.url === '/';
      }
    });
  }

  recuperaPass() {
    const modalElement = document.getElementById('modalRecuperar');
    if (modalElement) {
      const modal = new Modal(modalElement, {
        backdrop: 'static', // evita cerrar haciendo clic fuera
        keyboard: false     // evita cerrar con ESC
      });
      modal.show();
    }
  }
}
