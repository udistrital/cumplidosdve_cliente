import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobacionPagoComponent } from './aprobacion-pago.component';

describe('AprobacionPagoComponent', () => {
  let component: AprobacionPagoComponent;
  let fixture: ComponentFixture<AprobacionPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AprobacionPagoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AprobacionPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
