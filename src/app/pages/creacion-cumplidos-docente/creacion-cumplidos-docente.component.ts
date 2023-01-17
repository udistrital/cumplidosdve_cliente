import { Component, OnInit} from '@angular/core';
import { TablaCumplidos } from 'src/app/@core/models/tabla_cumplidos';
import { UtilService } from '../services/utilService';
import { LocalDataSource } from 'ng2-smart-table';
import { CargaDocumentosDocenteService } from '../services/carga-documentos-docente.service';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/userService';

@Component({
  selector: 'app-creacion-cumplidos-docente',
  templateUrl: './creacion-cumplidos-docente.component.html',
  styleUrls: ['./creacion-cumplidos-docente.component.scss']
})
export class CreacionCumplidosDocenteComponent implements OnInit {

  //SETTINGS
  CumplidosSettings: any;

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

  constructor(
    private request: RequestManager,
    private popUp: UtilService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private servicioCargaDocumentosDocente: CargaDocumentosDocenteService
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
            name: 'acciones',
            title: '<em title="Ver Cumplido"><button mat-button type="button"><i class="fa-regular fa-folder-open"></i></button></em>',
          }
        ],
      },
      selectedRowIndex: -1,
      noDataMessage: 'No hay cumplidos asociados al docente',
    };
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
        this.documentoDocente = data.userService.documento
      }
    })
  }

  ConsultarCumplidos(): void {
    this.popUp.loading();
    this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual/?query=numero_contrato:${this.information.NumeroVinculacion},vigencia_contrato:${this.information.Vigencia}`).subscribe({
      next: (response: Respuesta) => {
        if (response.Success){
          this.popUp.close();
          if (response.Data[0].hasOwnProperty('NumeroContrato')){
            this.CumplidosData = new LocalDataSource(response.Data);
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

  TomarTiempo(): string {
    var tiempo_actual = "";
    tiempo_actual = (new Date().getFullYear()) + "-" + ((new Date().getMonth()) + 1) + "-" + (new Date().getDate()) + " " + (new Date().getHours()) + ":" + (new Date().getMinutes()) + ":" + (new Date().getSeconds()) + "." + (new Date().getMilliseconds());
    return tiempo_actual;
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
            if(response.Data[0].hasOwnProperty('NumeroContrato')){
              this.popUp.error("Existe el cumplido seleccionado.")
            }else{
              //CONSULTAR PARAMETRO
              this.request.get(environment.PARAMETROS_SERVICE, `parametro/?query=codigo_abreviacion:CD,Nombre:CARGANDO DOCUMENTOS`).subscribe({
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
                    FechaCreacion: this.TomarTiempo(),
                    FechaModificacion: this.TomarTiempo(),
                    CargoResponsable: "DOCENTE",
                    Ano: this.AnoSeleccionado
                  }

                  //EJECUCION DEL POST
                  this.request.post(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `pago_mensual`, this.pago_mensual).subscribe({
                    next: (response: Respuesta) => {
                      if(response.Success){
                        this.popUp.close()
                        this.popUp.success("Su solicitud de cumplido ha sido creada.").then(() => {
                          this.ngOnInit()
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
}