import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import { RegistroUsuarios } from '../../services/registro-usuarios';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import Swal from 'sweetalert2';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, ReactiveFormsModule, NgHcaptchaModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {


  showModal: boolean = false;
  formulario!: FormGroup;
  formularioLogin!: FormGroup;

  correo_electronico: string = "";
  password: string = "";
  tipo_usuario: number = 1;

  captchaValido = false;
  token = signal<string | undefined>(undefined);
  expire = signal<boolean>(false);
  err = signal<string | undefined>(undefined);

    @Output() verify = new EventEmitter<string | undefined>();

  constructor(
    private fb: FormBuilder,
    private registroUsuario: RegistroUsuarios,
    private authService: AuthService,
    private router: Router
  ) {

    // formulario registrarme
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      repassword: ['', Validators.required],
      privacidad: [false, Validators.requiredTrue]
    }, { validators: this.passwordsIguales });

    // formulario inicio de sesión
    this.formularioLogin = this.fb.group({
      correo_electronico: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  passwordsIguales(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const repassword = group.get('repassword')?.value;
    return password === repassword ? null : { noCoinciden: true };
  }

  hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  }

  cancelar() {
    this.formulario.reset();
    this.showModal = false;
  }

  verNecesidades() {
    this.router.navigate(['/consulta']);
  }

  captchaToken(): string {
    return this.token() ?? "";
  }

  ingresar() {

    const correo = this.formularioLogin.get('correo_electronico')?.value;
    const password = this.formularioLogin.get('password')?.value;

    if (!correo || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor ingresa usuario y contraseña',
      });
      return;
    }

    if (!this.token()) {
      Swal.fire({
        icon: 'warning',
        title: 'Captcha requerido',
        text: 'Por favor completa el captcha antes de continuar',
      });
      return;
    }

    this.authService.login(correo, password, this.captchaToken())
      .subscribe({
        next: (resp: any) => {

          sessionStorage.setItem('token', resp.token);
          sessionStorage.setItem('nombre', JSON.stringify(resp.user.nombre));
          sessionStorage.setItem('usuario', resp.user.id);
          sessionStorage.setItem('tipo_usuario', resp.user.tipo_usuario);
          sessionStorage.setItem('direccion_distrital', resp.user.direccion_distrital);

          if (resp.user.tipo_usuario == 1) {
            sessionStorage.setItem('avisoPendiente', 'true');
            sessionStorage.setItem('muro',resp.user.video_muro)
            this.router.navigate(['/home']);
          } else if (resp.user.tipo_usuario == 2 || resp.user.tipo_usuario == 3) {
            this.router.navigate(['/necesidades']);
          }
        },
        error: (err) => {
          console.error("Login error:", err);

          if (err.error?.code === 404) {
            this.modalCuentaEncontrada();
            return;
          }

          if (err.error?.code === 402) {
            this.modalCuentaActiva();
            return;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: err.error?.message || 'Ocurrió un error al iniciar sesión. Por favor, verifica tus credenciales e intenta nuevamente.',
          });
        }
      });
  }

  registrarme() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  modalConfirmarCorreo() {
    const modalElement = document.getElementById('modalConfirmarCorreo');
    if (modalElement) {
      const modal = new Modal(modalElement, { backdrop: 'static', keyboard: false });
      modal.show();
    }
  }

  modalCuentaEncontrada() {
    const modalElement = document.getElementById('modalCuentaNoEncontrada');
    if (modalElement) {
      const modal = new Modal(modalElement, { backdrop: 'static', keyboard: false });
      modal.show();
    }
  }

  modalCuentaActiva() {
    const modalElement = document.getElementById('modalCuentaNoActiva');
    if (modalElement) {
      const modal = new Modal(modalElement, { backdrop: 'static', keyboard: false });
      modal.show();
    }
  }

  guardarDatos() {
    if (this.formulario.valid) {
      const hashedPassword = this.hashPassword(this.formulario.value.password);

      this.registroUsuario.guardar({
        tipo_usuario: 1,
        nombre_completo: this.formulario.value.nombre,
        correo_electronico: this.formulario.value.email,
        password: hashedPassword
      }).subscribe({
        next: () => {
          this.closeModal();
          this.formulario.reset();
          this.modalConfirmarCorreo();
        },
        error: (err) => {
          console.error(err);

          Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text: 'Ocurrió un error al guardar los datos. Por favor, intenta nuevamente.',
          });
        }
      });
    }
  }

  /*
  async guardarDatos() {

    if (this.formulario.valid) {
      const hashedPassword = await this.hashPassword(this.formulario.value.password);

      this.registroUsuario.guardar({
        tipo_usuario: 1,
        nombre_completo: this.formulario.value.nombre,
        correo_electronico: this.formulario.value.email,
        password: hashedPassword
      }).subscribe({
        next: () => {
          this.closeModal();
          this.formulario.reset();
          this.modalConfirmarCorreo();
        },
        error: (err) => {
          console.error(err);
          alert('Error al guardar los datos');
        }
      });
    }
  }
    */

  onVerify = (token: string) => {
      this.token.set(token);
      this.expire.set(false);
      this.verify.emit(this.token());
      this.captchaValido = true;
  }

  onExpired = (response: any) => {
    this.token.set(undefined);
    Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'El captcha a expirado, por favor intentalo nuevamente',
        confirmButtonText: 'Entendido'
    });
    this.captchaValido = false;
  }

  onError = (error: any) => {
      this.err.set(error);
      this.captchaValido = false;
  }

  changeUnidad(event: Event) {
    //Aqui va la logica de cambio de texto y la consulta al endpoint
  }
}

