import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { RequestManager } from '../services/requestManager';
import { UtilService } from '../services/utilService';
import { UserService } from '../services/userService';
import { Meses } from 'src/app/@core/data/select_meses.data';
import { LocalDataSource } from 'ng2-smart-table';
import { TablaPeticionesReporte } from 'src/app/@core/models/tabla_peticiones_reporte';
import { SmartTableService } from 'src/app/@core/services/smart_table_service';

@Component({
  selector: 'app-reporte-estado',
  templateUrl: './reporte-estado.component.html',
  styleUrls: ['./reporte-estado.component.scss']
})

export class ReporteEstadoComponent implements OnInit {
  nombreUsuario: string;
  peticionesSettings: any
  formularioReporte: FormGroup;
  vigencias: any[];
  facultades: any[];
  proyectos: any[];
  meses: any[];
  peticionesData: LocalDataSource;

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
    private userService: UserService,
    private smartTableService: SmartTableService,
    private fb: FormBuilder
  ) {
    this.initTable()
    this.formularioReporte = this.fb.group({
      facultad: ['', Validators.required],
      proyecto: ['',],
      vigencia: ['', Validators.required],
      mes: ['',],
    });
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

    TablaPeticionesReporte['ProyectoCurricular'] =
    {
      ...TablaPeticionesReporte['ProyectoCurricular'],
      ...this.smartTableService.getProyectoCurricularConf()
    }

    TablaPeticionesReporte['Documento'] =
    {
      ...TablaPeticionesReporte['Documento'],
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

    TablaPeticionesReporte['Estado'] =
    {
      ...TablaPeticionesReporte['Estado'],
      ...this.smartTableService.getEstadoSolicitudConf()
    }

    TablaPeticionesReporte['DocumentoResponsable'] =
    {
      ...TablaPeticionesReporte['DocumentoResponsable'],
      ...this.smartTableService.getDocumentoResponsableConf()
    }

    TablaPeticionesReporte['NombreResponsable'] =
    {
      ...TablaPeticionesReporte['NombreResponsable'],
      ...this.smartTableService.getNombreResponsableConf()
    }

    this.peticionesSettings = {
      columns: TablaPeticionesReporte,
      actions:false,
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

  obtenerProyectos(facultad) {
    this.proyectos = [...new Map(facultad.Opciones.map(item =>
      [item, item])).values()];
  }

  obtenerNombreUsuario() {
    this.userService.tercero$.subscribe((data: any) => {
      this.nombreUsuario = data.NomProveedor
    })
  }

  async consultarCumplidos() {
    if (this.formularioReporte.valid) {
      this.popUp.loading();
      let query = `?FacultadId=${this.formularioReporte.get('facultad').value.Id}&Vigencia=${this.formularioReporte.get('vigencia').value}`
      this.formularioReporte.get('proyecto').value ?
        query = query + `&ProyectoCurricularId=${this.formularioReporte.get('proyecto').value.Id}` : ""
      this.formularioReporte.get('mes').value ?
        query = query + `&Mes=${this.formularioReporte.get('mes').value.Mes}` : ""
      return new Promise((resolve, reject) => {
        this.request.get(
          environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_documentos/reporte_solicitudes${query}`).subscribe({
            next: (response: Respuesta) => {
              if (response.Success) {
                if (response.Data === null || (response.Data as any).length === 0) {
                  this.popUp.warning("No se encontraron datos para el reporte.");
                } else {
                  this.peticionesData = new LocalDataSource(response.Data);
                  this.peticionesData.refresh();
                  console.log(this.peticionesData)
                  this.popUp.close();
                }
                resolve(undefined);
              }
            },
            error: () => {
              reject(
                this.popUp.error("Error obteniendo reporte.")
              )
            }
          });
      });
    }
    else {
      this.popUp.warning("Revisa los campos obligatorios.");
    }
  }
}
