import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaPeticionesSupervisor } from 'src/app/@core/models/tabla_peticiones_supervisor';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { UserService } from '../services/userService';
import { UtilService } from '../services/utilService';

@Component({
  selector: 'app-aprobacion-supervisor',
  templateUrl: './aprobacion-supervisor.component.html',
  styleUrls: ['./aprobacion-supervisor.component.scss']
})
export class AprobacionSupervisorComponent implements OnInit {

  //SETTINGS
  PeticionesSupervisorSettings: any;

  //DATA
  PeticionesSupervisorData: LocalDataSource;
  NombreSupervisor = '';
  DocumentoSupervisor = '';
  CumplidosSelected : any = [];

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
    private userService: UserService,
  ) {
    this.initTable();
  }

  ngOnInit(): void {
    this.consultarNumeroDocumento();
    this.consultarSupervisor();
    this.consultarPeticiones();
  }

  initTable(): void {
    this.PeticionesSupervisorSettings = {
      selectMode: 'multi',
      columns: TablaPeticionesSupervisor,
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

  consultarNumeroDocumento(): void {
    this.popUp.loading();
    this.userService.user$.subscribe((data: any) => {
      if(data ? data.userService ? data.userService.documento ? true : false : false : false){
        this.DocumentoSupervisor = data.userService.documento;
      }
    });
  }

  consultarSupervisor(): void {
    this.popUp.loading();
    this.request.get(environment.ADMINISTRATIVA_AMAZON_SERVICE, `supervisor_contrato?query=Documento:${this.DocumentoSupervisor}&limit=0`).subscribe({
      next: (response: any) => {
        this.popUp.close();
        this.NombreSupervisor = response[0].Nombre;
      }, error: () => {
        this.popUp.close();
        this.popUp.error('No se ha podido consultar al coordinador.');
      }
    });
  }

  consultarPeticiones(): void {
    this.popUp.loading();
    this.request.get(environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_documentos/solicitudes_supervisor/${this.DocumentoSupervisor}`).subscribe({
      next: (response: Respuesta) => {
        if(response.Success){
          this.popUp.close();
          if(response.Data == null || (response.Data as any).length === 0){
            this.popUp.warning("No se han encontrado peticiones para el supervisor.");
          }else{
            this.PeticionesSupervisorData = new LocalDataSource(response.Data)
          }
        }
      }, error: () => {
        this.popUp.close();
        this.popUp.error("No existen peticiones asociadas al supervisor.");
      }
    });
  }

  Acciones(event): void {
    switch(event.action){
      case "Aprobar":{
        this.Aprobar(event);
        break;
      }
      case "Rechazar":{
        this.Rechazar(event);
        break;
      }
    }
  }

  Aprobar(event):void {
    this.popUp.confirm("Aprobar", "¿Está seguro que desea dar el visto bueno a la solicitud de cumplido?", "aprobar").then(result => {
      if (result.isConfirmed){
        //VARIABLES
        var cumplido: any;
        var parametro: any;
        var ordenador: string;

        //CONSULTAR PAGO MENSUAL
        this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual/?query=Id:${event.data.PagoMensual.Id}`).subscribe({
          next: (response: Respuesta) => {
            if(response.Success){
              cumplido = response.Data[0];

              //CONSULTAR EL PARAMETRO
              this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:PAD_DVE,Nombre:POR APROBAR DECANO(A)`).subscribe({
                next: (response: Respuesta) => {
                  if(response.Success){
                    parametro = response.Data;
                    if ((response.Data as any[]).length === 0) {
                      console.log("No se ha encontrado el parametro.")
                    }

                    //CONSULTA AL ORDENADOR DEL GASTO
                    //this.request.get(environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_pago/informacion_ordenador/${cumplido.NumeroContrato}/${cumplido.VigenciaContrato}`).subscribe({
                      //next: (response: Respuesta) => {
                        //if(response.Success){
                          //ordenador = String(response.Data.NumeroDocumento);
                          ordenador = '52310001';

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
                        //}
                      //}, error: () => {
                      //  this.popUp.error("No se ha podido aprobar el cumplido.");
                      //  console.log("No se ha podido consultar el Ordenador.");
                      //}
                    //});
                  }
                }, error: () => {
                  console.log("No se ha podido consultar el parametro.");
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
      if(result.isConfirmed){
        //VARIABLES
        var cumplido :any;
        var parametro : any;

        //CONSULTAR PAGO MENSUAL
        this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual/?query=Id:${event.data.PagoMensual.Id}`).subscribe({
          next:(response: Respuesta) => {
            if(response.Success){
              cumplido = response.Data[0];

              //CONSULTAR EL PARAMETRO
              this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:RS_DVE,Nombre:RECHAZO SUPERVISOR`).subscribe({
                next:(response: Respuesta) => {
                  if(response.Success){
                    parametro = response.Data;
                    if ((response.Data as any[]).length === 0) {
                      console.log("No se ha encontrado el parametro.")
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
                        if(response.Success){
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
                  console.log("No se ha podido consultar el parametro.")
                }
              });
            }
          }
        });
      }
    })
  }
  CumplidosSeleccionados(event): void {
    //VARIABLES
    var parametro: any;
    var cumplido: any;
    var ordenador: any;

    if(event.isSelected){
      //GUARDA EL CUMPLIDO
      cumplido = event.data.PagoMensual;

      //CONSULTA EL PARAMETRO
      this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:PAD_DVE,Nombre:POR APROBAR DECANO(A)`).subscribe({
        next: (response: Respuesta) => {
          if(response.Success){
            parametro = response.Data;
            if ((response.Data as any[]).length === 0) {
              console.log("No se ha encontrado el parametro.");
            }
            
            //CONSULTA AL ORDENADOR DEL GASTO
            //this.request.get(environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_pago/informacion_ordenador/${cumplido.NumeroContrato}/${cumplido.VigenciaContrato}`).subscribe({
              //next: (response: Respuesta) => {
                //if(response.Success){
                  //ordenador = String(response.Data.NumeroDocumento)
                  ordenador = '52310001';

                  //CAMBIA EL ESTADO Y AJUSTA VALORES
                  cumplido.Responsable = ordenador;
                  cumplido.CargoResponsable = "ORDENADOR DEL GASTO";
                  cumplido.EstadoPagoMensualId = parametro[0].Id;
                  cumplido.FechaCreacion = new Date(cumplido.FechaCreacion);
                  cumplido.FechaModificacion = new Date();
                  this.CumplidosSelected.push(cumplido);
                //}
              //}
            //});
          }
        }
      });
    }else{
      //ELIMINA EL CUMPLIDO
      for(var i = 0; i < this.CumplidosSelected.length; i++){
        if(this.CumplidosSelected[i] != null && this.CumplidosSelected[i].Id == event.data.PagoMensual.Id){
          delete this.CumplidosSelected[i];
        }
      }
      //VUELVE A ARMAR EL ARRAY SIN ESPACIOS EN BLANCO
      var cont = 0;
      var cumplidos_nuevo = [];
      for(var i = 0; i < this.CumplidosSelected.length; i++){
        if(this.CumplidosSelected[i] != null){
          cumplidos_nuevo[cont] = this.CumplidosSelected[i];
          cont++;
        }
      }
      this.CumplidosSelected = cumplidos_nuevo;
    }
  }
  AprobarMultiplesCumplidos(): void {
    if(this.CumplidosSelected[0] == null){
      this.popUp.warning("Por favor seleccione un cumplido para aprobar.")
    }else{
      this.popUp.confirm("Aprobar Cumplidos", "¿Está seguro que desea dar el visto bueno a las solicitudes de cumplidos seleccionadas?", "send").then(result => {
        if (result.isConfirmed) {
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
