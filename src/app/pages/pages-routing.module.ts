import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { CargaDocumentosDocenteComponent } from './carga-documentos-docente/carga-documentos-docente.component'

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
    }
  ]
    
}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
