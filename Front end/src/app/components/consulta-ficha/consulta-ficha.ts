import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule, ɵInternalFormsSharedModule, FormBuilder, Validators } from "@angular/forms";
import { Catalogos } from '../../services/catalogos/catalogos';
import { Necesidades } from '../../services/necesidades/necesidades';
import { environment } from '../../enviroments/enviroment';

@Component({
  selector: 'app-consulta-ficha',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ɵInternalFormsSharedModule],
  templateUrl: './consulta-ficha.html',
  styleUrl: './consulta-ficha.css',
})
export class ConsultaFicha {

public login = `${environment.login}`;

isOpen = true;
isUpdate = true;

catalogoUT: any[] = [];
segundaCat: any[] = [];
tercerCat: any[] = [];
enfoqueESP: any[] = [];
catalogoAlcaldia: any[] = [];
primerCAt: any[] = [];
formularioRegistro!: FormGroup;
 
constructor(private route: ActivatedRoute,
  private cd: ChangeDetectorRef,
  private catalogos: Catalogos,
  private registro: Necesidades,
  private formBuilder: FormBuilder
) {}

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.getRegistros(Number(id));
  }

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
}

/*cargarNecesidad(id: number) {
  this.http.get(`http://localhost:3000/api/necesidades/${id}`)
    .subscribe(data => {
      this.necesidad = data;
    });
}  */
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

  //catalogos
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


        getRegistros(idNecesidad: number) {
            this.isUpdate = true;
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



}
