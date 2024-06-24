import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { RequestManager } from './requestManager';
import { environment } from 'src/environments/environment';
import { DatosIdentificacion } from 'src/app/@core/models/datos_identificacion';

@Injectable({
  providedIn: 'root',
})
export class UserService {
    private userSubject = new BehaviorSubject({});
    public user$ = this.userSubject.asObservable();

    private terceroSubject = new BehaviorSubject({});
    public tercero$ = this.terceroSubject.asObservable();
    public terceroData: any = {}

  constructor(
    private request: RequestManager,
  ) { }

    updateUser(dataUser) {
        this.userSubject.next(dataUser);
    }

  updateTercero(data) {
    this.terceroData = { ...this.terceroData, ...data }
    this.terceroSubject.next(this.terceroData);
  }

  async getUserName(): Promise<string> {
    return new Promise<string>((resolve) => {
      this.user$.subscribe((data: any) => {
        if (data ? data.userService ? data.userService.documento ? true : false : false : false) {
          this.request.get(environment.ADMINISTRATIVA_AMAZON_SERVICE, `informacion_proveedor?query=NumDocumento:` + data.userService.documento)
            .subscribe((datosIdentificacion: DatosIdentificacion) => {
              let nombre = datosIdentificacion[0].NomProveedor;
              resolve(nombre);
            })
        }
      })
    })
  }

  getAllTercero() {

  }
}
