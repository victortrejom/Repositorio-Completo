import { Component, ChangeDetectorRef } from '@angular/core';
import Chart from 'chart.js/auto';
import { Necesidades } from '../../services/necesidades/necesidades';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NavbarComponent } from '../navbar/navbar';
import { SumateNecesidad } from '../formularios-modales/sumate-necesidad/sumate-necesidad';
import Swal from 'sweetalert2';
import { Publico } from '../../services/publico/publico';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-graficas-publica',
  imports: [NavbarComponent, SumateNecesidad],
  templateUrl: './graficas-publica.html',
  styleUrl: './graficas-publica.css',
})
export class GraficasPublica {
  tokenSesion: string = '';
  tipo_usuario: number = 0;
  direccion_distrital: number = 0;
  labels: string[] = [];
  values: number[] = [];
  showModalSumate = false;

  chart: any;
  modo: 'Alcaldia' | 'UT' = 'Alcaldia';

  constructor(
    private grafica: Publico,
    private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getAlcaldias();
  }

  getAlcaldias() {
    this.grafica.getAlcaldias().subscribe({
      next: (data) => {

        this.labels = [];
        this.values = [];

        data.alcaldiasPub.forEach((item: any) => {
          this.labels.push(item.demarcacion_territorial);
          this.values.push(item.total_votos);
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

  getUT() {
    this.grafica.getUnidadTerritorial().subscribe({
      next: (data) => {

        this.labels = [];
        this.values = [];

        data.unidadPub.forEach((item: any) => {
          this.labels.push(item.unidad_territorial);
          this.values.push(item.total_votos);
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
            text:
              this.modo === 'UT'
                ? 'Número de necesidades registradas por Unidad Territorial'
                : 'Número de necesidades registradas por Alcaldía',
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
  cambiarVista() {
    if (this.modo === 'UT') {
      this.modo = 'Alcaldia';
      
      this.getAlcaldias();

    } else {
      this.modo = 'UT';
      
      this.getUT();
    }
  }

  // descargar reporte
  openModalSumate() {
      this.showModalSumate = true;
  }

  closeModalSumate() {
    this.showModalSumate = false;
  }
}

