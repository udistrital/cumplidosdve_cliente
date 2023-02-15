import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobacionSupervisorComponent } from './aprobacion-supervisor.component';

describe('AprobacionSupervisorComponent', () => {
  let component: AprobacionSupervisorComponent;
  let fixture: ComponentFixture<AprobacionSupervisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AprobacionSupervisorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AprobacionSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
