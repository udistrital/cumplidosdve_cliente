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
          this.PeticionesSupervisorData = new LocalDataSource(response.Data)
          if((response.Data as any).length === 0){
            console.log("No se han encontrado peticiones.");
          }
        }
      }, error: () => {
        this.popUp.close();
        this.popUp.error("No existen peticiones asociadas al supervisor.");
      }
    });
  }

}
