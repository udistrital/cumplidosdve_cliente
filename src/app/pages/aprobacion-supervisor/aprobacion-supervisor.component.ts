import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaPeticiones } from 'src/app/@core/models/tabla_peticiones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { UserService } from '../services/userService';
import { UtilService } from '../services/utilService';
import { FixDataService } from 'src/app/@core/services/fix_data.service';

@Component({
  selector: 'app-aprobacion-supervisor',
  templateUrl: './aprobacion-supervisor.component.html',
  styleUrls: ['./aprobacion-supervisor.component.scss']
})
export class AprobacionSupervisorComponent implements OnInit {

  //SETTINGS
  PeticionesSupervisorSettings: any;
  DeshabilitarBoton: boolean = false;

  //DATA
  PeticionesSupervisorData: LocalDataSource;
  NombreSupervisor = '';
  DocumentoSupervisor = '';
  CumplidosSelected: any = [];

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
    private userService: UserService,
    private fixDataService: FixDataService

  ) {
    this.initTable();
  }

  async ngOnInit(): Promise<void> {
    this.popUp.loading();
    await this.consultarNumeroDocumento();
    await this.consultarSupervisor();
    await this.consultarPeticiones();
  }

  initTable(): void {
    this.PeticionesSupervisorSettings = {
      selectMode: 'multi',
      columns: TablaPeticiones,
      mode: 'external',
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: 'Acciones',
        custom: [
          {
            name: 'Aprobar',
            title: '<em title="Aprobar"><button mat-button type="button"><i class="fas fa-check"></i>    </button></em>'
          },
          {
            name: 'Rechazar',
            title: '<em title="Rechazar" class="rechazar"><button mat-button type="button">    <i class="fas fa-times"></i></button></em>'
          }
        ],
      },
      selectedRowIndex: -1,
      noDataMessage: 'No hay peticiones a revisar',
      pager: {
        display: true,
        perPage: 10,
      }
    };
  }

  async consultarNumeroDocumento() {
    return new Promise((resolve) => {
      this.userService.user$.subscribe((data: any) => {
        if (data && data.userService && data.userService.documento) {
          this.DocumentoSupervisor = data.userService.documento;
          resolve(undefined);
        }
        else {
          this.popUp.error('No se ha podido consultar documento del supervisor.')
        }
      });
    });
  }

  async consultarSupervisor() {
    return new Promise((resolve, reject) => {
      this.request.get(environment.ADMINISTRATIVA_AMAZON_SERVICE, `supervisor_contrato?query=Documento:${this.DocumentoSupervisor}&limit=0`).subscribe({

        next: (response: any) => {
          if (response && response.length > 0) {
            this.NombreSupervisor = response[0].Nombre;
            resolve(undefined);
          }
          else {
            this.popUp.error('No se ha podido consultar al supervisor.')
          }
        },
        error: () => {
          reject(
            this.popUp.error('Error en peticion al consultar al supervisor.')
          )
        }
      });
    });
  }

  async consultarPeticiones() {
    return new Promise((resolve, reject) => {
      this.request.get(environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_documentos/solicitudes_supervisor/${this.DocumentoSupervisor}`).subscribe({
        next: (response: Respuesta) => {
          if (response.Success) {
            if (response.Data === null || (response.Data as any).length === 0) {
              this.popUp.warning("No se encontraron peticiones para el Supervisor.");
            } else {
              this.fixDataService.setDatos(response.Data);
              let fixedData = this.fixDataService.getDatos();
              this.PeticionesSupervisorData = new LocalDataSource(fixedData);
              this.SuscribeEventosData();
              this.popUp.close();
            }
            resolve(undefined);
          }
        },
        error: (error: any) => {
          reject(
            this.popUp.error("Error obteniendo peticiones del supervisor.")
          )
        }
      });
    });
  }

  //SUSCRIPCION A LOS EVENTOS DE LOS DATOS DE LA TABLA
  SuscribeEventosData() {
    this.PeticionesSupervisorData.onChanged().subscribe(change => {
      switch (change.action) {
        case 'page':
          this.CumplidosSelected = [];
        case 'fliter':
          this.CumplidosSelected = [];
        case 'sort':
          this.CumplidosSelected = [];
      }
    });
  }

  Acciones(event): void {
    switch (event.action) {
      case "Aprobar": {
        this.Aprobar(event);
        break;
      }
      case "Rechazar": {
        this.Rechazar(event);
        break;
      }
    }
  }

  Aprobar(event): void {
    this.popUp.confirm("Aprobar", "¿Está seguro que desea dar el visto bueno a la solicitud de cumplido?", "aprobar").then(result => {
      if (result.isConfirmed) {
        this.popUp.loading();
        //VARIABLES
        var cumplido: any;
        var parametro: any;
        var ordenador: string;

        //CONSULTAR PAGO MENSUAL
        this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual/?query=Id:${event.data.PagoMensual.Id}`).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              cumplido = response.Data[0];

              //CONSULTAR EL PARAMETRO
              this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:PAD_DVE,Nombre:POR APROBAR DECANO(A)`).subscribe({
                next: (response: Respuesta) => {
                  if (response.Success) {
                    parametro = response.Data;
                    if ((response.Data as any[]).length === 0) {
                      this.popUp.error("No se ha encontrado el parámetro para cambio de estado.")
                    }

                    //CONSULTA AL ORDENADOR DEL GASTO
                    this.request.get(environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_pago/informacion_ordenador/${cumplido.NumeroContrato}/${cumplido.VigenciaContrato}`).subscribe({
                      next: (response: Respuesta) => {

                        if(response.Success){
                          ordenador = String(response.Data.NumeroDocumento);

                          //CAMBIA EL ESTADO Y AJUSTA VALORES
                          cumplido.Responsable = ordenador;
                          cumplido.CargoResponsable = "ORDENADOR DEL GASTO";
                          cumplido.EstadoPagoMensualId = parametro[0].Id;
                          cumplido.FechaCreacion = new Date(cumplido.FechaCreacion);
                          cumplido.FechaModificacion = new Date();

                          //APRUEBA LA SOLICITUD
                          this.request.put(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual`, cumplido, event.data.PagoMensual.Id).subscribe({
                            next: (response: Respuesta) => {
                              if (response.Success) {
                                this.popUp.close();
                                this.popUp.success("El cumplido ha sido aprobado.").then(() => {
                                  window.location.reload();
                                });
                              }
                            }, error: () => {
                              this.popUp.error("No se ha podido aprobar el cumplido.");
                            }
                          });
                        }
                      }, error: () => {
                        this.popUp.error("No se ha podido aprobar el cumplido.");
                        this.popUp.error("No se ha podido consultar el Ordenador.");
                      }
                    });
                  }
                }, error: () => {
                  this.popUp.error("No se ha encontrado el parámetro para cambio de estado.");
                  this.popUp.error("No se ha podido aprobar el cumplido.");
                }
              });
            }
          }
        });
      }
    });
  }

  Rechazar(event): void {
    this.popUp.confirm("Rechazar", "¿Está seguro que desea rechazar la solicitud de cumplido?", "rechazar").then(result => {
      if (result.isConfirmed) {
        //VARIABLES
        var cumplido: any;
        var parametro: any;

        //CONSULTAR PAGO MENSUAL
        this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual/?query=Id:${event.data.PagoMensual.Id}`).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              cumplido = response.Data[0];

              //CONSULTAR EL PARAMETRO
              this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:RS_DVE,Nombre:RECHAZO SUPERVISOR`).subscribe({
                next: (response: Respuesta) => {
                  if (response.Success) {
                    parametro = response.Data;
                    if ((response.Data as any[]).length === 0) {
                      this.popUp.error("No se ha encontrado el parámetro para cambio de estado.")
                    }

                    //CAMBIA EL ESTADO Y AJUSTA VALORES
                    cumplido.Responsable = cumplido.Persona;
                    cumplido.CargoResponsable = "DOCENTE";
                    cumplido.EstadoPagoMensualId = parametro[0].Id;
                    cumplido.FechaCreacion = new Date(cumplido.FechaCreacion);
                    cumplido.FechaModificacion = new Date();

                    //RECHAZA LA SOLICITUD
                    this.request.put(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual`, cumplido, event.data.PagoMensual.Id).subscribe({
                      next: (response: Respuesta) => {
                        if (response.Success) {
                          this.popUp.close();
                          this.popUp.success("El cumplido ha sido rechazado.").then(() => {
                            window.location.reload();
                          });
                        }
                      }, error: () => {
                        this.popUp.error("No se ha podido rechazar el cumplido.");
                      }
                    });
                  }
                }, error: () => {
                  this.popUp.error("No se ha podido consultar el parametro.")
                }
              });
            }
          }
        });
      }
    })
  }


  // ELIMINA LOS CMPLIDOS EN EL ARRAY DE APROBACION MULTIPLE
  ClearSelectedCumplidos(): void {
    this.CumplidosSelected = [];
  }


  CumplidosSeleccionados(event): void {


    //VARIABLES
    var parametro: any;
    var cumplido: any;
    var ordenador: any;

    if (event.isSelected === null) {
      if (event.selected.length > 0) {
        this.CumplidosSelected = [];
        this.DeshabilitarBoton = true;
        let cumplidosPromises = event.selected.map(cumplido => {
          return new Promise((resolve, reject) => {
            this.popUp.loading();
            this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:PAD_DVE,Nombre:POR APROBAR DECANO(A)`).subscribe({
              next: (response) => {
                if (response.Success) {
                  let parametro = response.Data;
                  if (parametro.length === 0) {
                    this.popUp.error("No se ha encontrado el parámetro para cambio de estado.");
                  }

                  this.request.get(environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_pago/informacion_ordenador/${cumplido.PagoMensual.NumeroContrato}/${cumplido.PagoMensual.VigenciaContrato}`).subscribe({
                    next: (response) => {
                      if (response.Success) {
                        let ordenador = String(response.Data.NumeroDocumento);
                        cumplido.PagoMensual.Responsable = ordenador;
                        cumplido.PagoMensual.CargoResponsable = "ORDENADOR DEL GASTO";
                        cumplido.PagoMensual.EstadoPagoMensualId = parametro[0].Id;
                        cumplido.PagoMensual.FechaCreacion = new Date(cumplido.PagoMensual.FechaCreacion);
                        cumplido.PagoMensual.FechaModificacion = new Date();
                        this.CumplidosSelected.push(cumplido.PagoMensual);
                        resolve(undefined);
                      }
                    },
                    error: (error) => {
                      reject(error);
                    }
                  });
                }
              },
              error: (error) => {
                reject(error);
              }
            });
          });
        });

        Promise.all(cumplidosPromises)
          .then(() => {
            this.DeshabilitarBoton = false;
            this.popUp.close();
          })
          .catch(error => {
            this.popUp.error("Error al seleccionar cumplidos").then(() => {
              window.location.reload();
            });
            this.DeshabilitarBoton = true;
          });
      }

      if (event.selected.length === 0) {
        this.ClearSelectedCumplidos();
      }
    }
    else {
      if (event.isSelected) {
        //GUARDA EL CUMPLIDO
        cumplido = event.data.PagoMensual;

        //CONSULTA EL PARAMETRO
        this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:PAD_DVE,Nombre:POR APROBAR DECANO(A)`).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              parametro = response.Data;
              if ((response.Data as any[]).length === 0) {
                this.popUp.error("No se ha encontrado el parámetro para cambio de estado.");
              }

              //CONSULTA AL ORDENADOR DEL GASTO
              this.request.get(environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_pago/informacion_ordenador/${cumplido.NumeroContrato}/${cumplido.VigenciaContrato}`).subscribe({
                next: (response: Respuesta) => {
                  if (response.Success) {
                    ordenador = String(response.Data.NumeroDocumento)
                    // ordenador = '52310001';

                    //CAMBIA EL ESTADO Y AJUSTA VALORES
                    cumplido.Responsable = ordenador;
                    cumplido.CargoResponsable = "ORDENADOR DEL GASTO";
                    cumplido.EstadoPagoMensualId = parametro[0].Id;
                    cumplido.FechaCreacion = new Date(cumplido.FechaCreacion);
                    cumplido.FechaModificacion = new Date();
                    this.CumplidosSelected.push(cumplido);
                  }
                }
              });
            } else {
              this.popUp.error("Error al seleccionar cumplido").then(() => {
                window.location.reload();
              });
            }
          }
        });
      } else {
        //ELIMINA EL CUMPLIDO
        for (var i = 0; i < this.CumplidosSelected.length; i++) {
          if (this.CumplidosSelected[i] != null && this.CumplidosSelected[i].Id == event.data.PagoMensual.Id) {
            delete this.CumplidosSelected[i];
          }
        }
        //VUELVE A ARMAR EL ARRAY SIN ESPACIOS EN BLANCO
        var cont = 0;
        var cumplidos_nuevo = [];
        for (var i = 0; i < this.CumplidosSelected.length; i++) {
          if (this.CumplidosSelected[i] != null) {
            cumplidos_nuevo[cont] = this.CumplidosSelected[i];
            cont++;
          }
        }
        this.CumplidosSelected = cumplidos_nuevo;
      }

    }
  }



  AprobarMultiplesCumplidos(): void {
    if (this.CumplidosSelected[0] == null) {
      this.popUp.warning("Por favor seleccione un cumplido para aprobar.")
    } else {
      this.popUp.confirm("Aprobar Cumplidos", "¿Está seguro que desea dar el visto bueno a las solicitudes de cumplidos seleccionadas?", "send").then(result => {
        if (result.isConfirmed) {
          this.popUp.loading();
          this.request.post(environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_documentos/aprobar_documentos`, this.CumplidosSelected).subscribe({
            next: (response: Respuesta) => {
              if (response.Success) {
                this.popUp.close();
                this.popUp.success("Los cumplidos seleccionados han sido aprobados.").then(() => {
                  this.CumplidosSelected = [];
                  window.location.reload();
                });
              }
            }, error: () => {
              this.popUp.error("No se ha podido aprobar los cumplidos seleccionados.");
            }
          });
        }
      });
    }
  }
}
