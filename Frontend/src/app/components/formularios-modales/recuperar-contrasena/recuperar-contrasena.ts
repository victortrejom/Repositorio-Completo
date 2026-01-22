import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecuperarPassword } from '../../../services/recuperaPass/recuperar-password';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.css',
})

export class RecuperarContrasena implements OnInit{

  formRecuperar!: FormGroup;
  showModal: boolean = false;

  constructor(private fb: FormBuilder, private miAuthService: RecuperarPassword) {}

  ngOnInit() {
    this.formRecuperar = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

   closeModal() {
    this.showModal = false;
  }

  recuperaPass() {
    const modalElement = document.getElementById('modalRecuperaContrasenia');
    if (modalElement) {
      const modal = new Modal(modalElement, {
        backdrop: 'static', 
        keyboard: false     
      });
      modal.show();
    }
  }

  noexisteaPass() {
    const modalElement = document.getElementById('modalRecuperaContraseniaVacio');
    if (modalElement) {
      const modal = new Modal(modalElement, {
        backdrop: 'static', 
        keyboard: false     
      });
      modal.show();
    }
  }

  enviarRecuperacion() {
    if (this.formRecuperar.invalid) return;

    const correo = this.formRecuperar.value.correo;

    this.miAuthService.recuperarPassword(correo).subscribe({
      next: (resp) => {
        this.closeModal();
        this.formRecuperar.reset();
        this.recuperaPass();
      },
      error: (err) => {
        this.closeModal();
        this.formRecuperar.reset();
        this.noexisteaPass();
      }
    });
  }

  cancelar() {
    this.formRecuperar.reset();
    this.showModal = false;
  }
}