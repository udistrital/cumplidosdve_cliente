import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-document-viewer',
  templateUrl: './modal-document-viewer.component.html',
})
export class ModalDocumentViewerComponent implements OnInit {

  documento: any;

  constructor(
    public dialogRef: MatDialogRef<ModalDocumentViewerComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  ngOnInit(): void {
    this.documento = this.data;
  }

}
