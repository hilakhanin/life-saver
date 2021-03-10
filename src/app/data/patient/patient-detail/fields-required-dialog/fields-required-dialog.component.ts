import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-fields-required-dialog',
  templateUrl: './fields-required-dialog.component.html',
  styleUrls: ['./fields-required-dialog.component.css']
})
export class FieldsRequiredDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
