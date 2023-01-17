import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RequestManager } from '../services/requestManager';

import { CreacionCumplidosDocenteComponent } from './creacion-cumplidos-docente.component';

describe('CreacionCumplidosDocenteComponent', () => {
  let component: CreacionCumplidosDocenteComponent;
  let fixture: ComponentFixture<CreacionCumplidosDocenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{path: 'pages/creacion_cumplidos_docente', component: CreacionCumplidosDocenteComponent}]),
      ],
      declarations: [ CreacionCumplidosDocenteComponent ],
      providers: [ RequestManager, HttpClient, HttpHandler]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreacionCumplidosDocenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
