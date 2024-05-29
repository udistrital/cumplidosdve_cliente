//VARIABLES
let Numero_Contrato ='';
let Mes = '';
let Ano = '';
export const TablaPeticionesSupervisor: any = {
    Id: {
        hide: true
    },
    Dependencia: {
        title: 'Proyecto Curricular',
        width: '15%',
        editable: false,
        filter: true,
        type: 'text',
        valuePrepareFunction: (data) => {
            return data.Nombre;
        },
        filterFunction: (data?: any, search?: string) => {
            return data.Nombre.toLowerCase().includes(search.toLowerCase());
        }
    },
    PagoMensual: {
        title: 'Documento',
        width: '10%',
        editable: false,
        filter: false,
        valuePrepareFunction: (data) => {
            Numero_Contrato = data.NumeroContrato;
            Mes = data.Mes;
            Ano = data.Ano;
            return data.Persona;
        }
    },
    NombrePersona: {
        title: 'Nombre Contratista',
        width: '20%',
        editable: false,
        filter: false
    },
    NumeroContrato: {
        title: 'Número Vinculación',
        width: '15%',
        editable: false,
        filter: false,
        valuePrepareFunction: () => {
            return Numero_Contrato;
        }
    },
    Mes: {
        title: 'Mes Solicitud',
        width: '15%',
        editable: false,
        filter: false,
        valuePrepareFunction: () => {
            return Mes;
        }
    },
    Ano: {
        title: 'Año Solicitud',
        width: '15%',
        editable: false,
        filter: false,
        valuePrepareFunction: () => {
            return Ano;
        }
    }
}