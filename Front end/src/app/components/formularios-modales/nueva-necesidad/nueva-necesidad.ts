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

@Component({
  selector: 'app-nueva-necesidad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ɵInternalFormsSharedModule],
  templateUrl: './nueva-necesidad.html',
  styleUrl: './nueva-necesidad.css',
})

export class NuevaNecesidadComponent implements OnInit {

  @Input() isOpen = false;
  @Input() idNecesidad!: number;
  @Output() close = new EventEmitter<void>();
  
  tokenSesion: string = '';
  usuario: number = 0;
  catalogoAlcaldia: any[] = [];
  catalogoUT: any[] = [];
  claveUT: string = '';
  primerCAt: any[] = [];
  segundaCat: any[] = [];
  tercerCat: any[] = [];
  enfoqueESP: any[] = [];
  idDistrito: Number = 0;
  tipo_usuario: number = 0;
  idUT: Number = 0;
  formularioRegistro!: FormGroup;
  isUpdate: boolean = false;
  noImg: boolean = true;

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

    this.formularioRegistro = this.formBuilder.group({
      alcaldia: ['', Validators.required],
      ut: ['', Validators.required],
      claveUT: [{ value: '', disabled: true }, Validators.required],
      catUno: ['', Validators.required],
      catDos: ['', Validators.required],
      catTres: ['', Validators.required],
      enfoqueEsp: ['', Validators.required],
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      idDistrito: [0, Validators.required],
      idUT: [0, Validators.required],
      folio: ['']
    });

    this.catalogo_alcaldia();
    this.catalogo_primerCategoria();
    this.catalogo_enfoque();
    
    if (this.idNecesidad && this.tipo_usuario !== 1) {
      this.getRegistros(this.idNecesidad);
      this.formularioRegistro.get('alcaldia')?.disable();
      this.formularioRegistro.get('ut')?.disable();
      this.formularioRegistro.get('claveUT')?.disable();
      this.formularioRegistro.get('catUno')?.disable();
      this.formularioRegistro.get('catDos')?.disable();
      this.formularioRegistro.get('catTres')?.disable();
      this.formularioRegistro.get('enfoqueEsp')?.disable();
      this.formularioRegistro.get('titulo')?.disable();
      this.formularioRegistro.get('descripcion')?.disable();
      this.formularioRegistro.get('folio')?.disable();
    } else {
    }

  }

  onChangeAlcaldia() {
    const control = this.formularioRegistro?.get('alcaldia');

    this.formularioRegistro!.patchValue({
      claveUT: '',
      ut: ''
    });

    if (control) {
      const id = Number(control.value);
      this.catalogo_ut(id);
    }
  }

  onChangeCat() {
    const control = this.formularioRegistro?.get('catUno');

    this.formularioRegistro!.patchValue({
      catDos: '',
      catTres: ''
    });

    if (control) {
      const id = Number(control.value);
      this.getSegundaCategoriaT(id);
    }


  }

  onChangeCatDos() {
    const control = this.formularioRegistro?.get('catDos');

    this.formularioRegistro!.patchValue({
      catTres: ''
    });


    if (control) {
      const id = Number(control.value);
      this.getTercerCategoriaT(id);
    }
  }

  onChangeUT() {
    const control = this.formularioRegistro?.get('ut');
    if (control) {
      const id = Number(control.value);
      this.getClaveUT(id);
    }
  }

  catalogo_alcaldia() {
    this.catalogos.getCatalogos("cat_alcaldia").subscribe({
      next: (data) => {
        this.catalogoAlcaldia = data.cat_alcaldia ?? [];
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error.code === 160) {
          Swal.fire("No se encontraron registros");
        }
      }
    });
  }

  catalogo_primerCategoria() {
    this.catalogos.getCatalogos("getPrimerCategoria").subscribe({
      next: (data) => {
        this.primerCAt = data.getPrimerCategoria ?? [];
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error.code === 160) {
            Swal.fire("No se encontraron registros");
        }
      }
    });
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


  getSegundaCategoriaT(id: number) {
    this.catalogos.getSegundaCategoria(id).subscribe({
      next: (data) => {
        this.segundaCat = data.getSegundaCategoria ?? [];
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
        this.formularioRegistro!.patchValue({
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
    if (this.formularioRegistro.valid) {

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
            direccion_distrital: this.formularioRegistro.value.idDistrito,
            demarcacion_territorial: this.formularioRegistro.value.alcaldia,
            unidad_territorial: this.formularioRegistro.value.idUT,
            primera_categoria: this.formularioRegistro.value.catUno,
            segunda_categoria: this.formularioRegistro.value.catDos,
            categoria_especifica: this.formularioRegistro.value.catTres,
            enfoque_especifico: this.formularioRegistro.value.enfoqueEsp,
            titulo_necesidad: this.formularioRegistro.value.titulo,
            descripcion_necesidad: this.formularioRegistro.value.descripcion,
            usuario_registro: this.usuario,
          }, this.tokenSesion).subscribe({
            next: (data) => {
              
                  this.isUpdate = true;
                                         
                  this.formularioRegistro.get('alcaldia')?.disable();
                  this.formularioRegistro.get('ut')?.disable();
                  this.formularioRegistro.get('claveUT')?.disable();
                  this.formularioRegistro.get('catUno')?.disable();
                  this.formularioRegistro.get('catDos')?.disable();
                  this.formularioRegistro.get('catTres')?.disable();
                  this.formularioRegistro.get('enfoqueEsp')?.disable();
                  this.formularioRegistro.get('titulo')?.disable();
                  this.formularioRegistro.get('descripcion')?.disable();
                  this.formularioRegistro.get('folio')?.disable();

                  this.formularioRegistro!.patchValue({
                        folio: data.folio
                });

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
                  this.cd.detectChanges();
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
    this.formularioRegistro.reset();
    this.close.emit();
  }

  cancelarExitoso(){
    this.close.emit();
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


  getRegistros(idNecesidad: number) {
    this.isUpdate = true;
    this.noImg = false;
    this.registro.getRegistro(
      idNecesidad
    ).subscribe({
      next: (data) => {
        const lista = data?.getRegistro ?? [];

        this.catalogo_ut(lista[0].demarcacion_territorial);
        this.getClaveUT(lista[0].unidad_territorial);
        this.getSegundaCategoriaT(lista[0].primera_categoria);
        this.getTercerCategoriaT(lista[0].segunda_categoria);

        if (lista.length > 0) {
          this.formularioRegistro!.patchValue({
            alcaldia: lista[0].demarcacion_territorial,
            ut: lista[0].unidad_territorial,
            claveUT: '01',
            catUno: lista[0].primera_categoria,
            catDos: lista[0].segunda_categoria,
            catTres: lista[0].categoria_especifica,
            enfoqueEsp: lista[0].enfoque_especifico,
            titulo: lista[0].titulo_necesidad,
            descripcion: lista[0].descripcion_necesidad,
            folio: lista[0].folio
          });

          this.cd.detectChanges();
        } else {
          Swal.fire("No se encontraron registros");
        }
      },
      error: (err) => {
        console.error(err);

        if (err.error?.code === 160) {
            Swal.fire("No se encontraron registros");
        }
        if (err.error?.code === 100) {
          Swal.fire("No se encontraron registros");
        }
      }
    });
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

}

