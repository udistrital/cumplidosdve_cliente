import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { RequestManager } from '../services/requestManager';
import { MatDialog } from '@angular/material/dialog';
import { UtilService } from '../services/utilService';
import { UserService } from '../services/userService';
import { Meses } from 'src/app/@core/data/select_meses.data';
import { LocalDataSource } from 'ng2-smart-table';
import { DatosIdentificacion } from 'src/app/@core/models/datos_identificacion';
import { TablaPeticionesReporte } from 'src/app/@core/models/tabla_peticiones_reporte';
import { SmartTableService } from 'src/app/@core/services/smart_table_service';

@Component({
  selector: 'app-reporte-estado',
  templateUrl: './reporte-estado.component.html',
  styleUrls: ['./reporte-estado.component.scss']
})
export class ReporteEstadoComponent implements OnInit {

  peticionesSettings: any

  PeticionesData: LocalDataSource;
  vigencias: any[] = [];
  vigenciaSeleccionada: any = null;
  periodos: any[] = [];
  periodoSeleccionado: any = null;
  facultades: any[] = [];
  facultadSeleccionada: any = null;
  proyectos: any[] = [];
  proyectoSeleccionado: any = null;
  meses: any[] = [];
  mesSeleccionado: any = null;
  peticionesData: LocalDataSource;
  nombreUsuario: string;


  constructor(
    private request: RequestManager,
    private popUp: UtilService,
    private userService: UserService,
    private smartTableService: SmartTableService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.popUp.loading();
    this.obtenerNombreUsuario();
    await this.cargarVigencias().then(() => {
      this.cargarDependencias();
      this.meses = Meses;
    })
    this.popUp.close();
  }

  initTable(): void {

    TablaPeticionesReporte['Dependencia'] =
    {
      ...TablaPeticionesReporte['Dependencia'],
      ...this.smartTableService.getProyectoCurricularConf()
    }

    TablaPeticionesReporte['PagoMensual'] =
    {
      ...TablaPeticionesReporte['PagoMensual'],
      ...this.smartTableService.getDocumentoConf()
    }

    TablaPeticionesReporte['NombrePersona'] =
    {
      ...TablaPeticionesReporte['NombrePersona'],
      ...this.smartTableService.getNombreConf()
    }

    TablaPeticionesReporte['NumeroContrato'] =
    {
      ...TablaPeticionesReporte['NumeroContrato'],
      ...this.smartTableService.getNumeroContratoConf()
    }

    TablaPeticionesReporte['Mes'] =
    {
      ...TablaPeticionesReporte['Mes'],
      ...this.smartTableService.getMesSolicitudConf()
    }

    TablaPeticionesReporte['Ano'] =
    {
      ...TablaPeticionesReporte['Ano'],
      ...this.smartTableService.getAnioSolicitudConf()
    }

    this.peticionesSettings = {
      selectMode: 'multi',
      columns: TablaPeticionesReporte,
      mode: 'external',
      selectedRowIndex: -1,
      noDataMessage: 'No hay peticiones a revisar',
      pager: {
        display: true,
        perPage: 10,
      }
    };
  }

  async cargarVigencias() {
    return new Promise<void>((resolve, reject) => {
      this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual?fields=VigenciaContrato&limit=-1`).subscribe({
        next: (response: Respuesta) => {
          if (response.Success) {
            if (!response.Data || (response.Data as any).length === 0) {
              this.popUp.warning("Error obteniendo vigencias.");
              reject('Error obteniendo vigencias.');
            } else {
              this.vigencias = [...new Map(response.Data.map(item =>
                [item['VigenciaContrato'], item['VigenciaContrato']])).values()];
              this.vigencias.sort((a, b) => a - b);
              resolve();
            }
          } else {
            this.popUp.warning("Error obteniendo vigencias.");
            reject('Error obteniendo vigencias.');
          }
        },
        error: () => {
          this.popUp.error('Error al obtener vigencias.');
          reject('Error al obtener vigencias.');
        }
      });
    });
  }


  cargarDependencias() {
    this.request.get(environment.OIKOS_SERVICE, `proyecto_curricular/get_all_proyectos_by_facultades`).subscribe({
      next: (response: any) => {
        if (response.length === 0) {
          this.popUp.error('Error obteniendo facultades y proyectos.');
        }
        else {
          this.facultades = response;
        }
      },
      error: () => {
        this.popUp.error('Error obteniendo facultades y proyectos.');
      }
    });
  }


  obtenerProyectos() {
    this.proyectos = [...new Map(this.facultadSeleccionada.Opciones.map(item =>
      [item['Nombre'], item['Nombre']])).values()];
  }

  obtenerNombreUsuario() {
    this.userService.tercero$.subscribe((data: any)=>{
      this.nombreUsuario = data.NomProveedor
    })
  }

  async consultarPeticiones() {
    return new Promise((resolve, reject) => {
      this.request.get(
        environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_documentos/solicitudes_coordinador/scs`).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              if (response.Data === null || (response.Data as any).length === 0) {
                this.popUp.warning("No se encontraron peticiones para el coordinador.");
              } else {
       
              }
              resolve(undefined);
            }
          },
          error: () => {
            reject(
              this.popUp.error("Error obteniendo peticiones del coordinador.")
            )
          }
        });
    });
  }


  consultarCumplidos() {

  }




}
