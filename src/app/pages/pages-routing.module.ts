import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { CargaDocumentosDocenteComponent } from './carga-documentos-docente/carga-documentos-docente.component'
import { CreacionCumplidosDocenteComponent } from './creacion-cumplidos-docente/creacion-cumplidos-docente.component';
import { AprobacionCoordinadorComponent } from './aprobacion-coordinador/aprobacion-coordinador.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: '', redirectTo: 'dashboard', pathMatch: 'full',
    },
    {
      path: 'carga_documentos_docente',
      component: CargaDocumentosDocenteComponent,
    },
    {
      path: 'creacion_cumplidos_docente',
      component: CreacionCumplidosDocenteComponent,
    },
    {
      path: 'aprobacion_coordinador',
      component: AprobacionCoordinadorComponent,
    }
  ]
    
}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
