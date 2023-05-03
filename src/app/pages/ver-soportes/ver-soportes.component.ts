import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Respuesta } from 'src/app/@core/models/respuesta';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { UtilService } from '../services/utilService';
import { VerSoportesService } from '../services/ver-soportes.service';

@Component({
  selector: 'app-ver-soportes',
  templateUrl: './ver-soportes.component.html',
  styleUrls: ['./ver-soportes.component.scss']
})
export class VerSoportesComponent implements OnInit {

  //VARIABLES
  information: any;
  soporte_pago_mensual:any = [];
  documentos:any = [];

  constructor(
    public dialogRef: MatDialogRef<VerSoportesComponent>,
    private request: RequestManager,
    private popUp: UtilService,
    private servicioVerSoportes: VerSoportesService
  ) {
  }

  ngOnInit(): void {
    this.RecibirData();
    this.ConsultarSoportePagoMensual();
  }

  Cerrar(): void {
    this.dialogRef.close();
  }

  RecibirData(): void {
    this.servicioVerSoportes.currentData.subscribe(data => {
      this.information = data;
    })
  }

  ConsultarSoportePagoMensual(): void {
    this.request.get(environment.CUMPLIDOS_DVE_CRUD_SERVICE, `soporte_pago_mensual/?query=pago_mensual_id:${this.information.Id}`).subscribe({
      next: (response: Respuesta) => {
        if(response.Success){
          if(response.Data[0] != undefined && response.Data[0].hasOwnProperty('Documento')){
            this.soporte_pago_mensual = response.Data;
            this.ConsultarDocumento();
          }else{
            console.log("No se encontraron documentos asociados a ese cumplido.");
          }
        }
      }, error: () => {
        console.log("No se ha podido consultar documentos asociados a ese cumplido.");
      }
    });
  }

  ConsultarDocumento(): void {
    for (var  i = 0; i<this.soporte_pago_mensual.length; i++){
      this.request.get(environment.CORE_SERVICE, `documento/?query=id:${this.soporte_pago_mensual[i].Documento}`).subscribe({
        next: (response: Respuesta) => {
          if(response[0].hasOwnProperty('Id')){
            this.documentos.push(response[0])
          }
        }
      });
    }
    console.log(this.documentos);
    
  }

  VerDocumento(): void {
    this.popUp.error("Función aún no implementada.")
  }

}
