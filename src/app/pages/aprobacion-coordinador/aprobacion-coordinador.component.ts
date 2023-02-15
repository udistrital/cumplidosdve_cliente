import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaPeticiones } from 'src/app/@core/models/tabla_peticiones';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { UserService } from '../services/userService';
import { UtilService } from '../services/utilService';

@Component({
  selector: 'app-aprobacion-coordinador',
  templateUrl: './aprobacion-coordinador.component.html',
  styleUrls: ['./aprobacion-coordinador.component.scss']
})
export class AprobacionCoordinadorComponent implements OnInit {

  //SETTINGS
  PeticionesSettings: any;

  //DATA
  PeticionesData: LocalDataSource;
  NombreCoordinador = '';
  documentoCoordinador = '';
  documentoSupervisor: any;
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
    this.consultarCoordinador();
    this.consultarPeticiones();
  }

  initTable(): void {
    this.PeticionesSettings = {
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
    };
  }

  consultarNumeroDocumento(): void {
    this.popUp.loading();
    this.userService.user$.subscribe((data: any) => {
      if(data ? data.userService ? data.userService.documento ? true : false : false : false){
        this.documentoCoordinador = data.userService.documento;
      }
    });
  }

  consultarCoordinador(): void {
    this.popUp.loading();
    this.request.get(
      environment.ACADEMICA_JBPM_SERVICE, `coordinador_carrera_snies/${this.documentoCoordinador}`).subscribe({
        next: (response: any) => {
              this.popUp.close();
              this.NombreCoordinador = response.coordinadorCollection.coordinador[0].nombre_coordinador;
        }, error: () => {
          this.popUp.close();
          this.popUp.error('No se ha podido consultar al coordinador.');
        }
      });
  }

  consultarPeticiones(): void {
    this.popUp.loading();
    this.request.get(
      environment.CUMPLIDOS_DVE_MID_SERVICE, `aprobacion_documentos/solicitudes_coordinador/${this.documentoCoordinador}`).subscribe({
        next: (response: Respuesta) => {
          if(response.Success){
            this.PeticionesData = new LocalDataSource(response.Data);
            if((response.Data as any).length === 0){
              console.log("No se han encontrado peticiones.");
            }
          }
        }, error: () => {
          this.popUp.error("No existen peticiones asociadas al coordinador.");
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

  Aprobar(event): void {
    this.popUp.confirm("Aprobar", "¿Está seguro que desea dar el visto bueno a la solicitud de cumplido?", "aprobar").then(result => {
      if (result.isConfirmed) {
        //VARIABLES
        var cumplido: any;
        var parametro: any;
        var Supervisor: any;

        //CONSULTAR PAGO MENSUAL
        this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual/?query=Id:${event.data.PagoMensual.Id}`).subscribe({
          next: (response: Respuesta) => {
            if (response.Success) {
              cumplido = response.Data[0];

              //CONSULTAR EL PARAMETRO
              this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:PRS_DVE,Nombre:POR REVISAR SUPERVISOR`).subscribe({
                next: (response: Respuesta) => {
                  if (response.Success) {
                    parametro = response.Data;
                    if ((response.Data as any[]).length === 0) {
                      console.log("No se ha encontrado el parametro.")
                    }

                    this.request.get(environment.ADMINISTRATIVA_JBPM_SERVICE, `contrato_elaborado/${cumplido.NumeroContrato}/${cumplido.VigenciaContrato}`).subscribe({
                      next: (response: any) => {
                        Supervisor = response.contrato.supervisor.documento_identificacion;

                        //CAMBIA EL ESTADO Y AJUSTA VALORES
                        cumplido.Responsable = Supervisor;
                        cumplido.CargoResponsable = "SUPERVISOR";
                        cumplido.EstadoPagoMensualId = parametro[0].Id;
                        cumplido.FechaCreacion = new Date(cumplido.FechaCreacion).toLocaleString("sv-SE");
                        cumplido.FechaModificacion = new Date().toLocaleString("sv-SE");

                        //APRUEBA LA SOLICITUD
                        this.request.put(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual`, cumplido, event.data.PagoMensual.Id).subscribe({
                          next: (response: Respuesta) => {
                            if (response.Success) {
                              this.popUp.close();
                              this.popUp.success("El cumplido ha sido aprobado.").then(() => {
                                this.ngOnInit();
                              });
                            }
                          }, error: () => {
                            this.popUp.error("No se ha podido aprobar el cumplido.");
                          }
                        });
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
              this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:RC_DVE,Nombre:RECHAZO COORDINADOR(A)`).subscribe({
                next: (response: Respuesta) => {
                  if (response.Success) {
                    parametro = response.Data;
                    if ((response.Data as any[]).length === 0) {
                      console.log("No se ha encontrado el parametro.")
                    }

                    //CAMBIA EL ESTADO Y AJUSTA VALORES
                    cumplido.Responsable = cumplido.persona;
                    cumplido.CargoResponsable = "DOCENTE";
                    cumplido.EstadoPagoMensualId = parametro[0].Id;
                    cumplido.FechaCreacion = new Date(cumplido.FechaCreacion).toLocaleString("sv-SE");
                    cumplido.FechaModificacion = new Date().toLocaleString("sv-SE");

                    //APRUEBA LA SOLICITUD
                    this.request.put(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual`, cumplido, event.data.PagoMensual.Id).subscribe({
                      next: (response: Respuesta) => {
                        if(response.Success){
                          this.popUp.close();
                          this.popUp.success("El cumplido ha sido rechazado.").then(() => {
                            this.ngOnInit();
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
    });
  }

  CumplidosSeleccionados(event): void {
    //VARIABLES
    var parametro: any;
    var cumplido: any;

    if(event.isSelected){
      this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:PRS_DVE,Nombre:POR REVISAR SUPERVISOR`).subscribe({
        next: (response: Respuesta) => {
          if(response.Success){
            parametro = response.Data;
            if ((response.Data as any[]).length === 0) {
              console.log("No se ha encontrado el parametro.");
            }
            this.request.get(environment.ADMINISTRATIVA_JBPM_SERVICE, `contrato_elaborado/${event.data.PagoMensual.NumeroContrato}/${event.data.PagoMensual.VigenciaContrato}`).subscribe({
              next: (response: any) => {
                //SE CREA EL CUMPLIDO Y SE CAMBIAN VALORES
                cumplido = event.data.PagoMensual;
                cumplido.Responsable = response.contrato.supervisor.documento_identificacion;
                cumplido.CargoResponsable = "SUPERVISOR";
                cumplido.EstadoPagoMensualId = parametro[0].Id;
                cumplido.FechaCreacion = new Date(cumplido.FechaCreacion).toLocaleString("sv-SE");
                cumplido.FechaModificacion = new Date().toLocaleString("sv-SE");
                this.CumplidosSelected.push(cumplido);
              }
            });
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

  AprobarMultiplesCumplidos():void {
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
                  this.ngOnInit();
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
