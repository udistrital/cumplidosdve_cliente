import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaDocumentosDocenteComponent } from './carga-documentos-docente.component';

describe('CargaDocumentosDocenteComponent', () => {
  let component: CargaDocumentosDocenteComponent;
  let fixture: ComponentFixture<CargaDocumentosDocenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargaDocumentosDocenteComponent ]
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
