import { TestBed } from '@angular/core/testing';

import { CargaDocumentosDocenteService } from './carga-documentos-docente.service';

describe('CargaDocumentosDocenteService', () => {
  let service: CargaDocumentosDocenteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CargaDocumentosDocenteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
