import { Component, ViewChild, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Chart from 'chart.js/auto';
import { Registro2 } from "../formularios-modales/registro2/registro2";

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, AvisoHome, CommonModule, Registro2, SumateNecesidad, ReactiveFormsModule, Registro2],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {

  formularioRegistro!: FormGroup;
  formularioNewNed!: FormGroup;
  allDatableOriginal: any[] = [];
  allDatable: any[] = [];
  catalogoUT: any[] = [];
  enfoqueESP: any[] = [];
  usuario: number | null = null;
  tipo_usuario: number | null = null;
  idSeleccionado!: number;
  primerCAt: any[] = [];
  segundaCat: any[] = [];
  catalogoAlcaldia: any[] = [];

  currentPage = 1;
  pageSize = 10;
  paginatedData: any[] = [];
  totalPages = 1;
  chart: any;
  labels: string[] = [];
  values: number[] = [];
  modo: 'Registro' | 'UT' = 'Registro';

  tokenSesion: string = '';
  showModal2 = false;
  showModalSumate = false;

  constructor(
    private formBuilder: FormBuilder,
    private serviceRegistros: Necesidades,
    private catalogos: Catalogos,
    private cd: ChangeDetectorRef,
    private grafica: Necesidades
  ) {

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

    //carga catalogos para registro
    this.catalogo_enfoque();

    //catalogos tabla de necesidades
    this.catalogo_ut();
    this.catalogo_primerCategoria();
    this.catalogo_alcaldia();
    this.getRegistros();
    this.updatePagination();

  }

  cerrarFormulario() {
  this.showModal2 = false;
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

          this.currentPage = 1;

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
    this.showModal2 = true;
  }

  closeModal() {
    this.showModal2 = false;
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
    this.getGraficas();
  }

  //consulta de tabla
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

  catalogo_utByid(id: number) {
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

  onChangeAlcaldia(event: any) {
    const id = Number(event.target.value);
    this.formularioRegistro!.patchValue({
      claveUT: '',
      ut: ''
    });

    this.catalogo_utByid(id);
  }


  filtrarPorPalabra(event: any) {
    const palabra = event.target.value.toLowerCase().trim();

    if (!palabra) {
      this.paginatedData = [...this.allDatableOriginal];
      this.cd.detectChanges();
      return;
    }

    this.paginatedData = this.allDatableOriginal.filter((item: any) => {
      return (
        item.titulo_necesidad?.toLowerCase().includes(palabra) ||
        item.descripcion_necesidad?.toLowerCase().includes(palabra) ||
        item.categoria?.toLowerCase().includes(palabra) ||
        item.total_votos?.toString().includes(palabra)
      );
    });

    this.cd.detectChanges();
  }


  onChangeCat1(event: any) {
    const idCat = Number(event.target.value);

    this.formularioNewNed.patchValue({
      catDos: '',
      catTres: ''
    });

    this.segundaCat = [];
    this.getSegundaCategoriaT(idCat);
  }



  onChangeCat(event: any) {
    const idCat = Number(event.target.value);

    this.formularioRegistro!.patchValue({
      catUno: idCat
    });
    this.getRegistros();
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


  ordenarVotos(event: any) {
    const valor = Number(event.target.value);

    if (valor === 1) {
      this.paginatedData.sort((a: any, b: any) => b.total_votos - a.total_votos);
    } else if (valor === 2) {
      this.paginatedData.sort((a: any, b: any) =>
        new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
      );
    } else if (valor === 3) {
      this.paginatedData.sort((a: any, b: any) =>
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
    this.showModal2 = true;
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


  //graficas
  getGraficas() {
    this.grafica.getTotNecesidades().subscribe({
      next: (data) => {

        this.labels = [];
        this.values = [];

        data.getTotales.forEach((item: any) => {
          this.labels.push(item.concepto);
          this.values.push(item.total);
        });
        this.crearGrafica(this.labels, this.values);
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err) {
          Swal.fire("No se encontraron registros");
        }
      }

    });
  }

  crearGrafica(labels: string[], values: number[]) {
    const ctx: any = document.getElementById('chartNecesidades');

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: 'rgba(176, 140, 255, 0.9)',
          }
        ]
      },
      options: {
        indexAxis: 'y',

        plugins: {
          legend: { display: false },

          title: {
            display: true,
            color: 'white',
            font: { size: 20 }
          },

          datalabels: {
            display: true,
            color: '#ffffff',
            anchor: 'end',
            align: 'center',
            clamp: true,
            clip: false,
            font: {
              weight: 'bold',
              size: 16
            },
            formatter: (value: any) => value
          }
        },

        scales: {
          x: {
            ticks: {
              color: 'transparent'
            },
            grid: {
              display: false
            }
          },
          y: {
            ticks: { color: 'white' },
            grid: {
              display: false
            }
          }
        }

      }
    });
  }


}
