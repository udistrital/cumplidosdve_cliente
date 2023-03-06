import { Component, OnInit } from '@angular/core';
import { TablaCumplidos } from 'src/app/@core/models/tabla_cumplidos';
import { UtilService } from '../services/utilService';
import { LocalDataSource } from 'ng2-smart-table';
import { CargaDocumentosDocenteService } from '../services/carga-documentos-docente.service';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/userService';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { VerSoportesComponent } from '../ver-soportes/ver-soportes.component';
import { VerSoportesService } from '../services/ver-soportes.service';

@Component({
  selector: 'app-creacion-cumplidos-docente',
  templateUrl: './creacion-cumplidos-docente.component.html',
  styleUrls: ['./creacion-cumplidos-docente.component.scss']
})



export class CreacionCumplidosDocenteComponent implements OnInit {

  //SETTINGS
  CumplidosSettings: any;
  DialogConfig: MatDialogConfig;

  //DATA
  CumplidosData: LocalDataSource;
  Data_Anos = [];
  Data_Meses = [];
  Data_Anos_Meses = [];
  Data_Mes_Enviado: any = 0;
  Data_Ano_Enviado: any = 0;

  //VARIABLES
  information: any;
  contrato: any={};
  Ano_Inicial: any;
  Ano_Final: any;
  Mes_Inicial: any;
  Mes_Final: any;
  Meses_Aux = [];
  Mes:any = [];
  AnoSeleccionado: any = 0;
  MesSeleccionado: any = 0;
  Parametro:any = [];
  pago_mensual:any = [];
  documentoDocente = '';
  coordinador : any ;

  constructor(
    private request: RequestManager,
    private dialog: MatDialog,
    private popUp: UtilService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private servicioCargaDocumentosDocente: CargaDocumentosDocenteService,
    private servicioVerSoportes: VerSoportesService,
  ) {
    this.initTable();
    this.Mes = {1:"ENERO", 2:"FEBRERO", 3:"MARZO", 4:"ABRIL", 5:"MAYO", 6:"JUNIO", 7:"JULIO", 8:"AGOSTO", 9:"SEPTIEMBRE", 10:"OCTUBRE", 11:"NOVIEMBRE", 12:"DICIEMBRE"}
  }

  ngOnInit(): void {
    this.RecibirData();
    if(this.information === null){
      this.router.navigate(["../carga_documentos_docente"], {relativeTo: this.route});
    }else{
      this.consultarNumeroDocumento();
      this.ConsultarCumplidos();
      this.ConsultarActaInicio();

      //MatDialogConfig
      this.DialogConfig = new MatDialogConfig();
      this.DialogConfig.width = '1200px';
      this.DialogConfig.height = '800px';
      this.DialogConfig.data = {};
    }
  }

  initTable(): void {
    this.popUp.loading();
    this.CumplidosSettings = {
      columns: TablaCumplidos,
      mode: 'external',
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: 'Acciones',
        custom: [
          {
            name: 'Ver-Soportes',
            title: '<em title="Ver Soportes"><button mat-button type="button"><i class="fa-regular fa-folder-open"></i></button></em>',
          },
          {
            name: 'Enviar-Cumplido',
            title: '<em title="Enviar" class="enviar-cumplido"><button mat-button type="button"><i id="enviar" class="fas fa-paper-plane"></i></button></em>',
          },
        ],
      },
      rowClassFunction: (row) => {
        if(row.data.EstadoPagoMensualId == "POR REVISAR SUPERVISOR" || row.data.EstadoPagoMensualId == "APROBADO SUPERVISOR" || row.data.EstadoPagoMensualId == "APROBACIÓN PAGO" || row.data.EstadoPagoMensualId == "POR REVISAR COORDINADOR(A)" || row.data.EstadoPagoMensualId == "POR APROBAR DECANO(A)" || row.data.EstadoPagoMensualId == "APROBADO DECANO(A)"){
          return 'borrar';
        }
      },
      selectedRowIndex: -1,
      noDataMessage: 'No hay cumplidos asociados al docente',
    }
  }

  RecibirData(): void {
    this.popUp.loading();
    this.servicioCargaDocumentosDocente.currentData.subscribe(data => {
      this.information = data;
    })
  }

  consultarNumeroDocumento(): void {
    this.popUp.loading();
    this.userService.user$.subscribe((data: any) => {
      if(data ? data.userService ? data.userService.documento ? true : false : false : false){
        this.documentoDocente = data.userService.documento;
      }
    })
  }
  ConsultarCumplidos(): void {
    this.popUp.loading();
    this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual/?query=numero_contrato:${this.information.NumeroVinculacion},vigencia_contrato:${this.information.Vigencia}`).subscribe({
      next: (response: Respuesta) => {
        if (response.Success){
          if (response.Data.length != 0){
            this.CumplidosData = new LocalDataSource(response.Data);
            this.CambioEstado(this.CumplidosData);
            setTimeout(() => {
              this.CumplidosData.setSort([{field: 'Mes', direction: 'desc'}],true);
              this.popUp.close();
            }, 3000);
          }else{
            this.popUp.close();
            this.popUp.warning("No existen cumplidos asociados al numero de contrato.");
          }
        }
      }, error: () => {
        this.popUp.error('No se han podido consultar los cumplidos del docente.')
      }
    });
  }

  ConsultarActaInicio(): void {
    this.request.get(environment.ADMINISTRATIVA_AMAZON_SERVICE, `acta_inicio/?query=numero_contrato:${this.information.NumeroVinculacion},vigencia:${this.information.Vigencia}`).subscribe({  
      next: (response: Respuesta) => {
        if(response != null){
          this.contrato = response;
          this.CargarMesesYDias();
        }else{
          console.log('No se encontraron actas de inicio del docente.');
        }
      }, error: () => {
        console.log("No se pudo consultar el acta de inicio del Docente");
      }
    })
  }

  ConsultarCoordinador(): void {
    this.request.get(environment.CUMPLIDOS_DVE_MID_SERVICE, `informacion_academica/informacion_coordinador/${this.information.IdDependencia}`).subscribe({
      next: (response:Respuesta) => {
        if(response.Success){
          this.coordinador = response.Data;
        }
      }
    });
  }

  CargarMesesYDias(): void {
    this.Ano_Inicial = new Date(this.contrato[0].FechaInicio).getFullYear();
    this.Ano_Final = new Date(this.contrato[0].FechaFin).getFullYear();

    for(var anio = this.Ano_Inicial; anio <= this.Ano_Final; anio++){
      this.Data_Anos.push(anio);
      this.Mes_Final = anio != this.Ano_Final ? 11 : (new Date(this.contrato[0].FechaFin).getUTCMonth() + 1);
      this.Mes_Inicial = anio === this.Ano_Inicial ? (new Date(this.contrato[0].FechaInicio).getUTCMonth()) : 0;
      this.Mes_Inicial = this.Mes_Inicial + 1;
      for ( var mes = this.Mes_Inicial; mes <= this.Mes_Final; mes = mes > 12 ? mes % 12 || 11 : mes + 1){
        var aux = mes;
        this.Data_Meses.push(this.Meses_Aux[aux] = this.Mes[mes])
      }
      this.Data_Anos_Meses[anio] = this.Data_Meses;
      this.Data_Meses = [];
    }
    
  }

  CrearSolicitud(): void {
    //VALIDA SI LOS CAMPOS ESTAN VACIOS
    if(this.MesSeleccionado == 0 || this.AnoSeleccionado == 0){
      this.popUp.error("Se deben completar los campos año y mes para solicitar el cumplido.")
    }else{
      this.popUp.loading()
      //TOMAR EL VALOR DEL MES SELECCIONADO
      for(var key = 0; key < 12; key++){
        if(this.Mes[key] == this.MesSeleccionado){
          this.MesSeleccionado = key;
        }
      }
      //VERIFICA SI EXISTE EL CUMPLIDO
      this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual/?query=numero_contrato:${this.information.NumeroVinculacion},vigencia_contrato:${this.information.Vigencia},Mes:${this.MesSeleccionado},Ano:${this.AnoSeleccionado}`).subscribe({
        next: (response: Respuesta) => {
          if(response.Success){
            
            if(response.Data.length != 0){
              this.popUp.warning("Ya existe el cumplido seleccionado.")
            }else{
              //CONSULTAR PARAMETRO
              this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:CD_DVE,Nombre:CARGANDO DOCUMENTOS`).subscribe({
                next: (response2: Respuesta) => {
                  if(response2.Success){
                    this.Parametro = response2.Data;
                    if((response2.Data as any[]).length === 0){
                      console.log("No se ha encontrado el parametro.");
                    }
                  }

                  //CREACION DE VARIABLE PARA EL POST
                  this.pago_mensual = {
                    NumeroContrato: this.information.NumeroVinculacion,
                    VigenciaContrato: this.information.Vigencia,
                    Mes: this.MesSeleccionado,
                    Persona: this.documentoDocente,
                    EstadoPagoMensualId: this.Parametro[0].Id,
                    Responsable: this.documentoDocente,
                    FechaCreacion: new Date(),
                    FechaModificacion: new Date(),
                    CargoResponsable: "DOCENTE",
                    Ano: this.AnoSeleccionado
                  }

                  //EJECUCION DEL POST
                  this.request.post(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual`, this.pago_mensual).subscribe({
                    next: (response: Respuesta) => {
                      if(response.Success){
                        this.popUp.close();
                        this.popUp.success("Su solicitud de cumplido ha sido creada.").then(() => {
                          this.ngOnInit();
                        });
                      }
                    }, error: () => {
                      this.popUp.error("No se pudo crear el cumplido.");
                    }
                  });

                }, error: () => {
                  console.log("No se ha podido consultar el parametro.");
                }  
              });
            }
          }
        }, error: () => {
          console.log("No se ha podido consultar si existe el cumplido");
        }
      });
    }
  }

  Acciones(event): void {
    switch(event.action){
      case "Ver-Soportes":{
        this.VerSoportes(event);
        break;
      }
      case "Enviar-Cumplido":{
        this.EnviarCumplido(event);
      }
    }
  }
  
  VerSoportes(event): void {
    this.servicioVerSoportes.SendData(event.data)
    this.dialog.open(VerSoportesComponent, this.DialogConfig);
  }

  EnviarCumplido(event): void {
    this.popUp.confirm("Enviar Cumplido", "¿Desea hacer el envío del cumplido para su revisión?", "send").then(result => {
      if(result.isConfirmed){
        //VARIABLES
        var cumplido = event.data;
        var parametro : any;
        this.ConsultarCoordinador();

        //CONSULTAR PAGO MENSUAL
        this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual/?query=Id:${event.data.Id}`).subscribe({
          next:(response: Respuesta) => {
            if(response.Success){
              cumplido = response.Data[0];

              //CONSULTA EL PARAMETRO
              this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:PRC_DVE,Nombre:POR REVISAR COORDINADOR(A)`).subscribe({
                next: (response: Respuesta) => {
                  if (response.Success) {
                    parametro = response.Data;
                    if ((response.Data as any[]).length === 0) {
                      console.log("No se ha encontrado el parametro.");
                    }

                    //CAMBIA EL ESTADO Y AJUSTA VALORES
                    cumplido.Responsable = this.coordinador.carreraSniesCollection.carreraSnies[0].numero_documento_coordinador;
                    cumplido.CargoResponsable = "COORDINADOR";
                    cumplido.EstadoPagoMensualId = parametro[0].Id;
                    cumplido.FechaCreacion = new Date(cumplido.FechaCreacion);
                    cumplido.FechaModificacion = new Date();

                    //ENVIA LA SOLICITUD
                    this.request.put(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual`, cumplido, event.data.Id).subscribe({
                      next: (response2: Respuesta) => {
                        if (response2.Success) {
                          this.popUp.close();
                          this.popUp.success("El cumplido ha sido enviado.").then(() => {
                            this.ngOnInit();
                          });
                        }
                      }, error: () => {
                        this.popUp.error("No se pudo enviar el cumplido.")
                      }
                    });
                  }
                }, error: () => {
                  console.log("No se ha podido consultar el parametro.");
                }
              });
            }
          }
        });
      }
    });
  }

  CambioEstado(Datos: any): void {
    for(let dato of Datos.data){
      this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=Id:${dato.EstadoPagoMensualId}`).subscribe({
        next: (response: Respuesta) => {
          dato.EstadoPagoMensualId = response.Data[0].Nombre;
        }
      })
    }
  }
}