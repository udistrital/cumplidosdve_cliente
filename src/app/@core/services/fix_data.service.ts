import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FixDataService {

  private data: [];

  public setDatos(value: []) {
    this.data = value;
  }

  public getDatos() {
    const nuevosDatos = this.data.map(this.reordenarDatos);
    return nuevosDatos;
  }

  private reordenarDatos(data) {
    return {
      Ano: data.PagoMensual.Ano,
      NumeroContrato: data.PagoMensual.NumeroContrato,
      Mes: data.PagoMensual.Mes,
      ...data
    };
  }
}
