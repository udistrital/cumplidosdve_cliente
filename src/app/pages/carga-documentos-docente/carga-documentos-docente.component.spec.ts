import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RequestManager } from '../services/requestManager';

import { CargaDocumentosDocenteComponent } from './carga-documentos-docente.component';

describe('CargaDocumentosDocenteComponent', () => {
  let component: CargaDocumentosDocenteComponent;
  let fixture: ComponentFixture<CargaDocumentosDocenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{path: 'pages/carga_documentos_docente', component: CargaDocumentosDocenteComponent}]),
      ],
      declarations: [ CargaDocumentosDocenteComponent ],
      providers: [RequestManager, HttpClient, HttpHandler]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CargaDocumentosDocenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
