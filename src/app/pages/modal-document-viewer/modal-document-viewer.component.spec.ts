import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDocumentViewerComponent } from './modal-document-viewer.component';

describe('ModalDocumentViewerComponent', () => {
  let component: ModalDocumentViewerComponent;
  let fixture: ComponentFixture<ModalDocumentViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDocumentViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDocumentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
