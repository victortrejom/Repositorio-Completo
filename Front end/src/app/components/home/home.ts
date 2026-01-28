import { Component, ViewChild, AfterViewInit, OnInit, ChangeDetectorRef, Host, HostListener } from '@angular/core';
import { Modal } from 'bootstrap';
import { AvisoHome } from '../formularios-modales/aviso-home/aviso-home';
import { NuevaNecesidadComponent } from '../formularios-modales/nueva-necesidad/nueva-necesidad';
import { CommonModule } from '@angular/common';
import { SumateNecesidad } from '../formularios-modales/sumate-necesidad/sumate-necesidad';
import { NavbarComponent } from '../navbar/navbar';
import { FormGroup, FormsModule, ɵInternalFormsSharedModule, FormBuilder, Validators } from "@angular/forms";
import { Necesidades } from '../../services/necesidades/necesidades';
import { Catalogos } from '../../services/catalogos/catalogos';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, AvisoHome, CommonModule, NuevaNecesidadComponent, SumateNecesidad, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {

  formularioRegistro!: FormGroup;
  formularioNewNed!: FormGroup;
  allDatableOriginal: any[] = [];
  allDatable: any[] = [];
  catalogoUT: any[] = [];
  usuario: number | null = null;
  tipo_usuario: number | null = null;
  idSeleccionado!: number;
  primerCAt: any[] = [];
  catalogoAlcaldia: any[] = [];

  currentPage = 1;
  pageSize = 10;
  paginatedData: any[] = [];
  totalPages = 1;

  tokenSesion: string = '';
  showModal = false;
  showModalSumate = false;

  shareOpen: number | null = null;

  public videoUrl: SafeResourceUrl;
  public mostrarFrame: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private serviceRegistros: Necesidades,
    private catalogos: Catalogos,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    const videoId = 'dQw4w9WgXcQ';
    const url = `https://www.youtube.com/embed/${videoId}`;
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnInit() {
    this.tokenSesion = sessionStorage.getItem('token')!;
    const video = sessionStorage.getItem('muro');
    const pendiente = sessionStorage.getItem('avisoPendiente');
    const usuarioStorage = sessionStorage.getItem('usuario');
    const tipoUsuarioStorage = sessionStorage.getItem('tipo_usuario');
    this.tipo_usuario = tipoUsuarioStorage ? Number(tipoUsuarioStorage) : null;

    this.formularioNewNed = this.formBuilder.group({
      alcaldiar: ['', Validators.required],
      utr: ['', Validators.required],
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

    this.usuario = usuarioStorage ? Number(usuarioStorage) : null;

    if (pendiente === 'true') {
      this.modalAviso();
    }

    this.formularioRegistro = this.formBuilder.group({
      alcaldia: [''],
      ut: [''],
      catUno: [''],
      ordenar: [null],
      direccion_distrital: [null]
    });

    this.catalogo_ut();
    this.catalogo_primerCategoria();
    this.catalogo_alcaldia();
    this.getRegistros();
    this.updatePagination();
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

          // Reiniciar página al cargar nuevos datos
          this.currentPage = 1;

          // ACTUALIZAR PAGINACIÓN
          this.updatePagination();

          this.cd.detectChanges();
        } else {
          this.allDatable = [];
          this.paginatedData = [];
          Swal.fire("No se encontraron registros");
        }
      },
      error: (err) => {
        console.error(err);
        this.allDatable = [];
        this.paginatedData = [];
        Swal.fire("No se encontraron registros");
      }
    });
  }

  // ---- PAGINACIÓN ---- //

  updatePagination() {
    this.totalPages = Math.ceil(this.allDatable.length / this.pageSize) || 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.paginatedData = this.allDatable.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // OPCIONAL: cambiar tamaño de página
  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePagination();
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

  menuAbierto = false;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  //codigo de consulta de tabla
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
  }

  onChangeCat(event: any) {
    const idCat = Number(event.target.value);

    this.formularioRegistro!.patchValue({
      catUno: idCat
    });
    this.getRegistros();
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

  onChangeUT(event: any) {
    const idUT = Number(event.target.value);

    this.formularioRegistro!.patchValue({
      ut: idUT
    });
    this.getRegistros();
  }

  limpiarFiltros() {
    this.formularioRegistro.patchValue({
      alcaldia: [''],
      ut: [''],
      catUno: [''],
      ordenar: null
    });

    const selectOrdenar: any = document.querySelector('select[formControlName="ordenar"]');
    if (selectOrdenar) {
      this.ordenarVotos({ target: selectOrdenar });
    }

    this.getRegistros();
  }

  soloVer(id_necesidad: number) {
    this.idSeleccionado = id_necesidad;
    this.showModal = true;
  }


  compartir(id_necesidad: number) {
    this.idSeleccionado = id_necesidad;
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

  cerrarFrame() {
    this.mostrarFrame = false;
  }

  abrirFrame() {
    if (!this.mostrarFrame) {
      this.mostrarFrame = true;
    }
  }

  toggleShare(id: number) {
    this.shareOpen = this.shareOpen === id ? null : id;
  }

  getShareUrl(id: number): string {
    return encodeURIComponent(`${window.location.origin}/necesidad/${id}`);
  }

  shareFacebook(id: number) {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${this.getShareUrl(id)}`,
      '_blank'
    );
    this.shareOpen = null;

  }

  shareWhatsapp(id: number) {
    window.open(
      `https://wa.me/?text=${this.getShareUrl(id)}`,
      '_blank'
    );
    this.shareOpen = null;
  }

  shareX(id: number) {
    window.open(
      `https://twitter.com/intent/tweet?url=${this.getShareUrl(id)}`,
      '_blank'
    );
    this.shareOpen = null;

  }

  copyLink(id: number) {
    const url = `${window.location.origin}/necesidad/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copiado 📋');
    });
  }


}
