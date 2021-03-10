import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileGeneratorService } from '../../shared/file-generator/file-generator.service';

@Component({
  selector: 'app-dialog-file-generation',
  templateUrl: './dialog-file-generation.component.html',
  styleUrls: ['./dialog-file-generation.component.css']
})
export class DialogFileGenerationComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fgs: FileGeneratorService) { }

  onDownloadFile() {
    this.fgs.downloadFile();
  }

}
