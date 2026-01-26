import { Component, ChangeDetectorRef } from '@angular/core';
import Chart from 'chart.js/auto';
import { AuthService } from '../../services/auth-service';
import { Necesidades } from '../../services/necesidades/necesidades';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NavbarComponent } from '../navbar/navbar';
import { SumateNecesidad } from '../formularios-modales/sumate-necesidad/sumate-necesidad';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-graficas',
  templateUrl: './graficas.html',
  imports: [NavbarComponent, SumateNecesidad],
  styleUrls: ['./graficas.css']
})
export class Graficas {

  tokenSesion: string = '';
  tipo_usuario: number = 0;
  direccion_distrital: number = 0;
  labels: string[] = [];
  values: number[] = [];
  showModalSumate = false;

  chart: any;
  modo: 'Alcaldia' | 'UT' = 'Alcaldia';

  constructor(
    private service: AuthService,
    private grafica: Necesidades,
    private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.tokenSesion = sessionStorage.getItem('token')!;
    this.tipo_usuario = Number(sessionStorage.getItem('tipo_usuario')!);
    this.direccion_distrital = Number(sessionStorage.getItem('direccion_distrital')!);

    if (this.tipo_usuario == 2) {
      this.getAlcaldiasByid(this.direccion_distrital); // para mostrar todos si filtros
    } else if (this.tipo_usuario == 3) {
      this.getAlcaldias(null); // para mostrar todos si filtros
    }

  }


  getAlcaldias(id: number | null) {
    this.grafica.getAlcaldias(id, this.tokenSesion).subscribe({
      next: (data) => {

        this.labels = [];
        this.values = [];

        data.getAlcaldia.forEach((item: any) => {
          this.labels.push(item.demarcacion_territorial);
          this.values.push(item.total_votos);
        });
        this.crearGrafica(this.labels, this.values);
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }
      }

    });
  }

  getAlcaldiasByid(id: number | null) {
    this.grafica.getAlcaldiasByid(id, this.tokenSesion).subscribe({
      next: (data) => {
        this.labels = [];
        this.values = [];

        data.getAlcaldiasById.forEach((item: any) => {

          this.labels.push(item.demarcacion_territorial);
          this.values.push(item.total_votos);
        });
        this.crearGrafica(this.labels, this.values);
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }
      }

    });
  }


  getUT(id: number | null) {
    this.grafica.getUnidadTerritorial(id, this.tokenSesion).subscribe({
      next: (data) => {

        this.labels = [];
        this.values = [];

        data.getUnidadTerritorial.forEach((item: any) => {
          this.labels.push(item.unidad_territorial);
          this.values.push(item.total_votos);
        });
        this.crearGrafica(this.labels, this.values);
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }
      }

    });
  }

  getUTById(id: number | null) {
    this.grafica.getUnidadTerritorialByid(id, this.tokenSesion).subscribe({
      next: (data) => {

        this.labels = [];
        this.values = [];

        data.getUnidadTerritorialById.forEach((item: any) => {
          this.labels.push(item.unidad_territorial);
          this.values.push(item.total_votos);
        });
        this.crearGrafica(this.labels, this.values);
        this.cd.detectChanges();
      },
      error: (err) => {
        if (err.error.code === 160) {
          this.service.cerrarSesionByToken();
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

      if (this.tipo_usuario == 2) {
        this.getAlcaldiasByid(this.direccion_distrital);
      } else {
        this.getAlcaldias(null);
      }

    } else {
      this.modo = 'UT';

      if (this.tipo_usuario == 2) {
        this.getUTById(this.direccion_distrital);
      } else {
        this.getUT(null);
      }
    }
  }

  // descargar reporte
  descargarReporte() {

    const direccion =
      isNaN(this.direccion_distrital as any) ? null : this.direccion_distrital;

    this.grafica.getReporte(direccion, this.tokenSesion).subscribe({
      next: (blob: Blob) => {

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte General.xlsx';
        a.click();

        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(err);
        if (err.error?.code === 160) {
          this.service.cerrarSesionByToken();
        }
      }
    });
  }

  openModalSumate() {
      this.showModalSumate = true;
  }

  closeModalSumate() {
    this.showModalSumate = false;
  }

}
