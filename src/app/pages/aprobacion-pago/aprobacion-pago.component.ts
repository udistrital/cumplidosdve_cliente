import { Component, OnInit } from '@angular/core';
import { TablaPeticionesOrdenador } from 'src/app/@core/models/tabla_peticiones_ordenador';

@Component({
  selector: 'app-aprobacion-pago',
  templateUrl: './aprobacion-pago.component.html',
  styleUrls: ['./aprobacion-pago.component.scss']
})
export class AprobacionPagoComponent implements OnInit {

  //SETTINGS
  PeticionesOrdenadorSettings: any;


  constructor() {
    this.initTable();
  }

  ngOnInit(): void {
  }

  initTable(): void {
    this.PeticionesOrdenadorSettings = {
      selectMode: 'multi',
      columns: TablaPeticionesOrdenador,
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
}
