import { Injector } from '@angular/core';
import { SmartTableService } from "../services/smart_table_service";

//VARIABLES
const injector: Injector = Injector.create({
    providers: [{ provide: SmartTableService, useClass: SmartTableService }]
});
const TableService: SmartTableService = injector.get(SmartTableService);

export const TablaPeticiones: any = {
    Id: {
        hide: true
    },
    Dependencia: {
        title: 'Proyecto Curricular',
        width: '15%',
        editable: false,
        filter: true,
        type: 'text',
        ...TableService.getProyectoCurricularConf()
    },
    PagoMensual: {
        title: 'Documento',
        width: '10%',
        editable: false,
        filter: true,
        type: 'text',
        ...TableService.getDocumentoConf()
    },
    NombrePersona: {
        title: 'Nombre Profesor',
        width: '20%',
        editable: false,
        filter: true,
        ...TableService.getNombreConf()
    },
    NumeroContrato: {
        title: 'Número Contrato',
        width: '15%',
        editable: false,
        filter: true,
        ...TableService.getNumeroContratoConf()
    },
    Mes: {
        title: 'Mes Solicitud',
        width: '15%',
        editable: false,
        filter: true,
        ...TableService.getMesSolicitudConf
    },
    Ano: {
        title: 'Año Solicitud',
        width: '15%',
        editable: false,
        filter: true,
        ...TableService.getAnioSolicitudConf()
    }
}