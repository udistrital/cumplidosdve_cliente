import { TestBed } from '@angular/core/testing';

import { VerSoportesService } from './ver-soportes.service';

describe('VerSoportesService', () => {
  let service: VerSoportesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerSoportesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
