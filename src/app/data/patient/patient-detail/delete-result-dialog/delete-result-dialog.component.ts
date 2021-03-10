import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-result-dialog',
  templateUrl: './delete-result-dialog.component.html',
  styleUrls: ['./delete-result-dialog.component.css']
})
export class DeleteResultDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
