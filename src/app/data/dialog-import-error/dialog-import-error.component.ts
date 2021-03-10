import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-import-error',
  templateUrl: './dialog-import-error.component.html',
  styleUrls: ['./dialog-import-error.component.css']
})
export class DialogImportErrorComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

}
