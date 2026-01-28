import { FormGroup, FormsModule, ɵInternalFormsSharedModule, FormBuilder, Validators } from "@angular/forms";
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { Necesidades } from '../../../services/necesidades/necesidades';
import { ChangeDetectorRef } from '@angular/core';
import { Catalogos } from '../../../services/catalogos/catalogos';
import { NuevaNecesidadComponent } from "../nueva-necesidad/nueva-necesidad";
import { Router } from "@angular/router";

@Component({
  selector: 'app-sumate-necesidad',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NuevaNecesidadComponent,
  ],
  templateUrl: './sumate-necesidad.html',
  styleUrl: './sumate-necesidad.css',
})
export class SumateNecesidad {

  @Input() isOpen2 = false;
  @Output() close = new EventEmitter<void>();

  constructor(
    private router: Router,
    private serviceRegistros: Necesidades,
    private catalogos: Catalogos,
    private cd: ChangeDetectorRef,
    private formBuilder: FormBuilder,
  ) {}

  formularioRegistro!: FormGroup;
  catalogoAlcaldia: any[] = [];
  catalogoUT: any[] = [];
  tokenSesion: string = '';
  haVotado?: boolean;
  primerCAt: any[] = [];
  allDatable: any[] = [];
  allDatableOriginal: any[] = [];
  id_catalogo: number = 0;
  id_unidad: number = 0;
  showModal = false;
  idSeleccionado!: number;
  tipo_usuario: number | null = null;
  direccion_distrital: number | null = null;
  usuario: number | null = null;
  estado: boolean = false;

  ngOnInit() {
    this.tokenSesion = sessionStorage.getItem('token') || '';

    const usuarioStorage = sessionStorage.getItem('usuario');
    const tipoUsuarioStorage = sessionStorage.getItem('tipo_usuario');
    const direccion_distrital = sessionStorage.getItem('direccion_distrital');
    const dd = Number(direccion_distrital);
    this.direccion_distrital = isNaN(dd) ? null : dd;
    this.usuario = usuarioStorage ? Number(usuarioStorage) : null;
    this.tipo_usuario = tipoUsuarioStorage ? Number(tipoUsuarioStorage) : null;

    this.formularioRegistro = this.formBuilder.group({
      alcaldia: [''],
      ut: [''],
      catUno: [''],
      ordenar: [null],
      direccion_distrital: [null]
    });

    this.catalogo_primerCategoria();
    this.catalogo_alcaldia();

    if (!this.tipo_usuario || this.tipo_usuario == 3) {
      this.formularioRegistro!.patchValue({
        direccion_distrital:  null
      });

    } else {
      this.formularioRegistro!.patchValue({
        direccion_distrital: this.direccion_distrital
      });
    }

    if (this.tipo_usuario !== 1) {
      this.estado = true;
    } else {
      this.catalogo_ut();
    }

    this.getRegistros();
  }


  catalogo_primerCategoria() {
    this.catalogos.getCatalogos("getPrimerCategoria").subscribe({
      next: (data) => {
        this.primerCAt = data.getPrimerCategoria ?? [];
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err) {
          Swal.fire("No se encontraron registros");
        }
      }
    });
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


  catalogo_ut() {
    this.catalogos.getCatalogos("cat_unidadTerritorialAll").subscribe({
      next: (data) => {
        this.catalogoUT = data.cat_unidadTerritorialAll ?? [];
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err) {
          Swal.fire("No se encontraron registros");
        }
      }
    });
  }
  cat_all(id: number) {
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


  onChangeUT(event: any) {
    const idUT = Number(event.target.value);

    this.formularioRegistro!.patchValue({
      ut: idUT
    });
    this.getRegistros();
  }

  onChangeCat(event: any) {
    const idCat = Number(event.target.value);

    this.formularioRegistro!.patchValue({
      catUno: idCat
    });
    this.getRegistros();
  }

  getRegistros() {
    this.serviceRegistros.getSumate(
      this.formularioRegistro.value.direccion_distrital,
      this.formularioRegistro.value.alcaldia,
      this.formularioRegistro.value.ut,
      this.formularioRegistro.value.catUno,
      this.formularioRegistro.value.ordenar
    ).subscribe({
      next: (data) => {
        const lista = data?.sumate ?? [];

        if (lista.length > 0) {
          this.allDatableOriginal = lista;
          this.allDatable = [...lista];
          this.cd.detectChanges();

        } else {
          this.allDatable = [];
          Swal.fire("No se encontraron registros");
        }
      },
      error: (err) => {
        console.error(err);
        if (err) {
          Swal.fire("No se encontraron registros");
        }
        if (err.error?.code === 100) {
          this.allDatable = [];
          Swal.fire("No se encontraron registros");
        }
      }
    });
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

  soloVer(id_necesidad: number) {
    this.idSeleccionado = id_necesidad;
    this.showModal = true;
  }

  
  compartir(id_necesidad: number) {
    this.idSeleccionado = id_necesidad;
  }

  votarFalso(){
      sessionStorage.clear(); 
      this.router.navigate(['/login']);
      this.cd.detectChanges();
  }

  async votar(id_necesidad: number) {

    Swal.fire({
      title: "¿Está seguro de apoyar esta necesidad?",
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

        this.serviceRegistros.addVoto({
          registro_necesidad: id_necesidad,
          usuario_registro: this.usuario
        }, this.tokenSesion).subscribe({

          next: (data) => {
            if (data.code === 200) {
              Swal.fire({
                title: "Su apoyo fue registrado",
                text: data.folio,
                icon: "success",
                confirmButtonText: "Aceptar",
                customClass: {
                  confirmButton: 'btn-aceptar',
                },
                buttonsStyling: false
              }).then(() => {
                this.getRegistros();
                this.modalAvisoRecuerda();
                this.cd.detectChanges();
              });
            }
          },

          error: (err) => {
            if (err.error?.code === 409) {
              Swal.fire({
                title: "Ya has emitido tu apoyo",
                icon: "warning",
                confirmButtonText: "Aceptar",
                customClass: {
                  confirmButton: 'btn-aceptar',
                },
                buttonsStyling: false
              });
              return;
            }

            // Otros errores
            Swal.fire({
              title: "Error",
              text: "No fue posible registrar tu apoyo.",
              icon: "error",
              confirmButtonText: "Aceptar",
              customClass: {
                confirmButton: 'btn-aceptar',
              },
              buttonsStyling: false
            });

          }

        });
      }

    });
  }


  cancelar() {
    this.close.emit();
  }


  closeModal() {
    this.showModal = false;
  }

  ordenarVotos(event: any) {
    const valor = Number(event.target.value);

    if (valor === 1) {
      this.allDatable.sort((a: any, b: any) => b.total_votos - a.total_votos);
    } else if (valor === 2) {
      this.allDatable.sort((a: any, b: any) =>
        new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
      );
    } else if (valor === 3) {
      this.allDatable.sort((a: any, b: any) =>
        a.titulo_necesidad.localeCompare(b.titulo_necesidad)
      );
    }

    this.getRegistros();
    this.cd.detectChanges();
  }


  filtrarPorPalabra(event: any) {
    const palabra = event.target.value.toLowerCase().trim();

    if (!palabra) {
      this.allDatable = [...this.allDatableOriginal];
      this.cd.detectChanges();
      return;
    }

    this.allDatable = this.allDatableOriginal.filter((item: any) => {
      return (
        item.titulo_necesidad?.toLowerCase().includes(palabra) ||
        item.descripcion_necesidad?.toLowerCase().includes(palabra) ||
        item.categoria?.toLowerCase().includes(palabra) ||
        item.total_votos?.toString().includes(palabra)
      );
    });

    this.cd.detectChanges();
  }

  onChangeAlcaldia() {
    const control = this.formularioRegistro?.get('alcaldia');

    this.formularioRegistro!.patchValue({
      claveUT: '',
      ut: ''
    });

    if (control) {
      const id = Number(control.value);
      this.cat_all(id); //seria ut catalogo_ut
    }
    this.getRegistros();
  }

  limpiarFiltros() {
  this.formularioRegistro.patchValue({
    alcaldia: [''],
    ut: [''],
    catUno: [''],
    ordenar: null
  });

  // Forzar que se ejecute tu change
  const selectOrdenar: any = document.querySelector('select[formControlName="ordenar"]');
  if (selectOrdenar) {
    this.ordenarVotos({ target: selectOrdenar });
  }

  this.getRegistros();
}



}
