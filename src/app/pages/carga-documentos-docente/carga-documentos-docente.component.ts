import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { TablaCargaDocumentosDocente } from 'src/app/@core/models/tabla_carga_documentos_docente';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { UserService } from '../services/userService';
import { UtilService } from '../services/utilService';
import { Router, ActivatedRoute } from '@angular/router';
import { CargaDocumentosDocenteService } from '../services/carga-documentos-docente.service';

@Component({
  selector: 'app-carga-documentos-docente',
  templateUrl: './carga-documentos-docente.component.html',
  styleUrls: ['./carga-documentos-docente.component.scss']
})

export class CargaDocumentosDocenteComponent implements OnInit {

  CargaDocumentosDocentesSettings : any;
  CargaDocumentosDocenteData: LocalDataSource;
  NombreDocente = '';
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
  }

  ngOnInit(): void {
    this.consultarNumeroDocumento();
    this.consultarDocente();
  }

  initTable(): void {
    this.popUp.loading();
    this.CargaDocumentosDocentesSettings = {
      columns: TablaCargaDocumentosDocente,
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
            title: '<em title="Solicitar Cumplido"><button mat-button type="button"><i class="fa-solid fa-upload"></i></button></em>',
          },
        ],
      },
      selectedRowIndex: -1,
      noDataMessage: 'No hay contratos asociados al docente',
    };
  }

  consultarNumeroDocumento(): void {
    this.popUp.loading();
    this.userService.user$.subscribe((data: any) => {
      if(data ? data.userService ? data.userService.documento ? true : false : false : false){
        this.documentoDocente = data.userService.documento
      }
    })
  }

  consultarDocente(): void {
    this.popUp.loading();
    this.request.get(
      environment.CUMPLIDOS_DVE_MID_SERVICE, `informacion_academica/contratos_docente/${this.documentoDocente}`
    ).subscribe({
      next: (response: Respuesta) => {
        if (response.Success){
          this.popUp.close();
          this.CargaDocumentosDocenteData = new LocalDataSource(response.Data);
          this.NombreDocente = response.Data[0].NombreDocente
          if ((response.Data as any[]).length === 0 ) {
            this.popUp.warning('No se encontraron contratos para el docente.');
          }
        }
      }, error: () => {
        this.popUp.close();
        this.popUp.error('No se han podido consultar los contratos del docente.');
      }
    });
  }

  CreacionCumplidosDocente(event): void {
    this.servicioCargaDocumentosDocente.SendData(event.data)
    this.router.navigate(["../creacion_cumplidos_docente"], {relativeTo: this.route});
  }
}
