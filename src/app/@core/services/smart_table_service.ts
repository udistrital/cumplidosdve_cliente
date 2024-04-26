import { LocalDataSource } from 'ng2-smart-table';
import { PagoMensual } from '../models/pago_mensual';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SmartTableService {

    Data: LocalDataSource;
    PagoMensual: PagoMensual;
    PagoMensualArr = [];

    constructor(
    ) {

    }
    public setPagoMensualData(data: LocalDataSource) {
        this.Data = data;
        this.Data.getAll().then((value) => {
            value.forEach(val => {
                this.PagoMensualArr.push(val.Dependencia);
            })
        })
    }

    public getProyectoCurricularConf() {
        return {
            valuePrepareFunction: (cell?: any) => {
                return this.prepareFunctionProyectoCurricular(cell)
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionProyectoCurricular(cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionProyectoCurricular(direction, a, b);
            },
        };
    }

    public getProyectoNombre() {
        return {
            valuePrepareFunction: (cell?: any) => {
                return this.prepareFunctionNombre(cell)
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionNombre(cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionNombre(direction, a, b);
            },
        };
    }

    public getDocumentoConf() {
        return {
            valuePrepareFunction: (cell?: any) => {
                return this.prepareFunctionDocumento(cell)
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionDocumento(cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionDocumento(direction, a, b);
            },

        };
    }

    public getNumeroContratoConf() {
        return {
            valuePrepareFunction: (cell?: any) => {
                return this.prepareFunctionNumeroContrato(cell)
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionNumeroContrato(cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionNumeroContrato(direction, a, b);
            },
        };
    }

    public getMesSolicitudConf() {
        return {
            valuePrepareFunction: (cell?: any) => {
                return this.prepareFunctionMesSolicitud(cell)
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionMesSolicitud(cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionMesSolicitud(direction, a, b);
            },
        };
    }

    public getAnioSolicitudConf() {
        return {
            valuePrepareFunction: (cell?: any) => {
                return this.prepareFunctionAnioSolicitud(cell)
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionAnioSolicitud(cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionAnioSolicitud(direction, a, b);
            },
        };
    }

    private prepareFunctionProyectoCurricular(value?: any) {
        if (!value) {
            return '';
        }
        return value.Nombre
    }


    private compareFunctionProyectoCurricular(direction: any, a: any, b: any) {
        const first = this.prepareFunctionProyectoCurricular(a);
        const second = this.prepareFunctionProyectoCurricular(b);
        return this.getOrder(first, second, direction);
    }

    private filterFunctionProyectoCurricular(cell?: any, search?: string): boolean {

        if (!search.length) {
            return false;
        }

        const value = this.prepareFunctionProyectoCurricular(cell);
        if (!value) {
            return false;
        }

        if ((value.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
            return true;
        }

        return false;
    }

    private prepareFunctionNombre(value?: any) {
        if (!value) {
            return '';
        }
        return value.Nombre
    }


    private compareFunctionNombre(direction: any, a: any, b: any) {
        const first = this.prepareFunctionNombre(a);
        const second = this.prepareFunctionNombre(b);
        return this.getOrder(first, second, direction);
    }

    private filterFunctionNombre(cell?: any, search?: string): boolean {

        if (!search.length) {
            return false;
        }

        const value = this.prepareFunctionNombre(cell);
        if (!value) {
            return false;
        }

        if ((value.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
            return true;
        }

        return false;
    }

    private prepareFunctionDocumento(value?: any) {
        if (!value) {
            return '';
        }
        this.PagoMensual = value
        return value.Persona
    }

    private compareFunctionDocumento(direction: any, a: any, b: any) {
        const first = this.prepareFunctionProyectoCurricular(a);
        const second = this.prepareFunctionProyectoCurricular(b);
        return this.getOrder(first, second, direction);
    }

    private filterFunctionDocumento(cell?: any, search?: string): boolean {

        if (!search.length) {
            return false;
        }

        const value = this.prepareFunctionProyectoCurricular(cell);
        if (!value) {
            return false;
        }

        if ((value.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
            return true;
        }

        return false;
    }

    private prepareFunctionNumeroContrato(value?: any) {
        console.log(value)
        if (!value) {
            return '';
        }
        return value
    }

    private compareFunctionNumeroContrato(direction: any, a: any, b: any) {
        const first = this.prepareFunctionNumeroContrato(a);
        const second = this.prepareFunctionNumeroContrato(b);
        return this.getOrder(first, second, direction);
    }

    private filterFunctionNumeroContrato(cell?: any, search?: string): boolean {

        if (!search.length) {
            return false;
        }

        const value = this.prepareFunctionNumeroContrato(cell);
        if (!value) {
            return false;
        }

        if ((value.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
            return true;
        }

        return false;
    }

    private prepareFunctionMesSolicitud(value?: any) {
        console.log(value)
        if (!value) {
            return '';
        }
        return value
    }

    private compareFunctionMesSolicitud(direction: any, a: any, b: any) {
        const first = this.prepareFunctionMesSolicitud(a);
        const second = this.prepareFunctionMesSolicitud(b);
        return this.getOrder(first, second, direction);
    }

    private filterFunctionMesSolicitud(cell?: any, search?: string): boolean {

        if (!search.length) {
            return false;
        }

        const value = this.prepareFunctionMesSolicitud(cell);
        if (!value) {
            return false;
        }

        if ((value.toString().toUpperCase()).indexOf(search.toUpperCase()) > -1) {
            return true;
        }

        return false;
    }

    private prepareFunctionAnioSolicitud(value?: any) {
        console.log(value)
        if (!value) {
            return '';
        }
        return value
    }

    private compareFunctionAnioSolicitud(direction: any, a: any, b: any) {
        const first = this.prepareFunctionAnioSolicitud(a);
        const second = this.prepareFunctionAnioSolicitud(b);
        return this.getOrder(first, second, direction);
    }

    private filterFunctionAnioSolicitud(cell?: any, search?: string): boolean {

        if (!search.length) {
            return false;
        }

        const value = this.prepareFunctionAnioSolicitud(cell);
        if (!value) {
            return false;
        }

        if ((value.toString().toUpperCase()).indexOf(search.toUpperCase()) > -1) {
            return true;
        }

        return false;
    }

    private getOrder(first: any, second: string, direction: any): number {
        if (first < second) {
            return -1 * direction;
        }
        if (first > second) {
            return direction;
        }
        return 0;
    }





}   
