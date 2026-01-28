import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Catalogos } from '../../../services/catalogos/catalogos';
import { AuthService } from '../../../services/auth-service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { Modal } from 'bootstrap';
import { FormGroup, FormsModule, ReactiveFormsModule, ɵInternalFormsSharedModule, FormBuilder, Validators } from "@angular/forms";
import { Necesidades } from '../../../services/necesidades/necesidades';
import { Publico } from '../../../services/publico/publico';
import { NuevaNecesidadComponent } from '../nueva-necesidad/nueva-necesidad';

@Component({
  selector: 'app-registro2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NuevaNecesidadComponent,
    ɵInternalFormsSharedModule],
    templateUrl: './registro2.html',
    styleUrl: './registro2.css',
})

export class Registro2 implements OnInit {

  @Input() formulario!: FormGroup;
  @Input() segundaCat: any[] = [];
  @Input() catalogoUT: any[] = [];

  @Input() isOpen = false;
  @Input() idNecesidad!: number;
  @Output() closeFormulario = new EventEmitter<void>();
  
  tokenSesion: string = '';
  usuario: number = 0;
  catalogoAlcaldia: any[] = [];
  claveUT: string = '';
  primerCAt: any[] = [];
  tercerCat: any[] = [];
  enfoqueESP: any[] = [];
  idDistrito: Number = 0;
  tipo_usuario: number = 0;
  idUT: Number = 0;
  isUpdate: boolean = false;
  noImg: boolean = true;
  paso = 1;
  showModal = false;
  idSeleccionado!: number;
  timeoutId: any;


  constructor(
    private catalogos: Catalogos,
    private service: AuthService,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private registro: Necesidades,
    private miServicio: Publico
  ) { }


  ngOnInit() {
    this.tokenSesion = sessionStorage.getItem('token')!;
    this.usuario = Number(sessionStorage.getItem('usuario')!);
    this.tipo_usuario = Number(sessionStorage.getItem('tipo_usuario')!);

    this.catalogo_enfoque();

  }

  siguientePaso() {
    if (this.paso === 1) this.paso = 2;
  }

  pasoAnterior() {
    if (this.paso === 2) this.paso = 1;
  }  
  onChangeCatDos() {
    const id = this.formulario.get('catDos')?.value;
    this.getTercerCategoriaT(id);
  }

  onChangeUT() {
    const control = this.formulario?.get('utr');
    if (control) {
      const id = Number(control.value);
      this.getClaveUT(id);
      console.log("accion", id)
    }
      console.log("accion2", control)
  }
  catalogo_enfoque() {
    this.catalogos.getCatalogos("getCatalogoEnfoqueEsp").subscribe({
      next: (data) => {
        this.enfoqueESP = data.getCatalogoEnfoqueEsp ?? [];
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error.code === 160) {          
            Swal.fire("No se encontraron registros");
        }
      }
    });
  }
  getTercerCategoriaT(id: number) {
    this.catalogos.getTercerCategoria(id).subscribe({
      next: (data) => {
        this.tercerCat = data.getTercerCategoria ?? [];
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error.code === 160) {
             Swal.fire("No se encontraron registros");
        }
      }
    });
  }


  catalogo_ut(id: number) {
    this.catalogos.getCatalogoUT(id).subscribe({
      next: (data) => {
        this.catalogoUT = data.cat_unidadTerritorial ?? [];
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error.code === 160) {          
            Swal.fire("No se encontraron registros");
        }
      }
    });
  }

  getClaveUT(id: number) {
    this.catalogos.getClaveUT(id).subscribe({
      next: (data) => {

        const clave = data.getClaveUT[0].clave_ut ?? '';
        const id = data.getClaveUT[0].direccion_distrital ?? '';
        const id_UT = data.getClaveUT[0].id ?? '';

        // Asignas al formulario:
        this.formulario!.patchValue({
          claveUT: clave,
          idDistrito: id,
          idUT: id_UT
        });

        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error.code === 160) {
            Swal.fire("No se encontraron registros");
        }
      }
    });
  }

  async guardarDatos() {
    console.log("formulario", this.formulario);
    if (this.formulario.valid) {

      Swal.fire({
        title: "¿Está seguro de registrar esta necesidad?",
        showCancelButton: true,
        confirmButtonText: "Si",
        cancelButtonText: "No",
        customClass: {
          confirmButton: 'btn-aceptar',
          cancelButton: 'btn-cancelar'
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.isConfirmed) {

          this.registro.insertaRegistro({
            direccion_distrital: this.formulario.value.idDistrito,
            demarcacion_territorial: this.formulario.value.alcaldiar,
            unidad_territorial: this.formulario.value.idUT,
            primera_categoria: this.formulario.value.catUno,
            segunda_categoria: this.formulario.value.catDos,
            categoria_especifica: this.formulario.value.catTres,
            enfoque_especifico: this.formulario.value.enfoqueEsp,
            titulo_necesidad: this.formulario.value.titulo,
            descripcion_necesidad: this.formulario.value.descripcion,
            usuario_registro: this.usuario,
          }, this.tokenSesion).subscribe({
            next: (data) => {


              const modal = document.getElementById('modalFormulario2');
              modal?.classList.remove('show', 'd-block');

              this.idSeleccionado = data.id;
              this.showModal = true;   


              if (data.code === 200) {
                Swal.fire({
                  title: "El registro fue exitoso Se le ha asignado el folio:",
                  text: data.folio,
                  showCancelButton: false,
                  confirmButtonText: "Aceptar",
                  customClass: {
                    confirmButton: 'btn-aceptar',
                  },
                  buttonsStyling: false
                }).then(() => {

                  this.formulario!.patchValue({
                    alcaldiar: '',
                    utr: '',
                    claveUT: '',
                    catUno: '',
                    catDos: '',
                    catTres: '',
                    enfoqueEsp: '',
                    titulo: '',
                    descripcion:'',
                    idDistrito:'',
                    idUT: ''
                  });
                    
                  this.cd.detectChanges();

                  /*this.formulario.reset();
                    this.formulario.markAsPristine();
                    this.formulario.markAsUntouched();

                    this.showModal = false;
                    this.close.emit();

                    this.cd.detectChanges();
                   */
                });
              }
            }, error: (err) => {

              if (err.error.code === 160) {
                this.service.cerrarSesionByToken();
              }

              if (err.error.code === 100) {
                Swal.fire("Error al registrar");
              }
            }
          });

        } else {
          return;
        }
      });
    }
  }


  cancelar() {
     this.formulario!.patchValue({
      alcaldiar: '',
      utr: '',
      claveUT: '',
      catUno: '',
      catDos: '',
      catTres: '',
      enfoqueEsp: '',
      titulo: '',
      descripcion: '',
      idDistrito: '',
      idUT: ''
    });

    this.closeFormulario.emit();
  }

  cancelarExitoso(){
    this.closeFormulario.emit();
    Swal.fire({
      title: "La ficha fue enviada al correo electrónico registrado",
      showCancelButton: false,
      confirmButtonText: "Aceptar",
      customClass: {
        confirmButton: 'btn-aceptar',
      },
      buttonsStyling: false
    }).then(() => {
      this.isUpdate = true;
      this.modalAvisoRecuerda();
      this.cd.detectChanges();
    });
    this.cd.detectChanges();
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

  modalAvisoRecuerda() {
    const modalElement = document.getElementById('modalAvisoRecuerda');
    if (modalElement) {
      const modal = new Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
      modal.show();
    }
  }
  descargarCategorias(){
     this.miServicio.descargarCategorias("1757703550661-Categorias.docx").subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Catalogo de categorias';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error al descargar archivo:', err)
    });
  }

  closeModal() {
    this.showModal = false;
  }

}

