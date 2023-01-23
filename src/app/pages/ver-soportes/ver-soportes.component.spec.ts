import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerSoportesComponent } from './ver-soportes.component';

describe('VerSoportesComponent', () => {
  let component: VerSoportesComponent;
  let fixture: ComponentFixture<VerSoportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerSoportesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerSoportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
