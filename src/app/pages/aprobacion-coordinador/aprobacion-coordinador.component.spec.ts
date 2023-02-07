import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobacionCoordinadorComponent } from './aprobacion-coordinador.component';

describe('AprobacionCoordinadorComponent', () => {
  let component: AprobacionCoordinadorComponent;
  let fixture: ComponentFixture<AprobacionCoordinadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AprobacionCoordinadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AprobacionCoordinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
