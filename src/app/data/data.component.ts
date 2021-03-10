import { Component, OnInit } from '@angular/core';
import { FileGeneratorService } from '../shared/file-generator/file-generator.service';
import { DataService } from './data.service';
import { Patient } from './patient.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpEventType } from '@angular/common/http';
import { DialogFileGenerationComponent } from './dialog-file-generation/dialog-file-generation.component';
import { DialogImportErrorComponent } from './dialog-import-error/dialog-import-error.component';
import { ScoreService } from '../shared/score.service';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {

  patients: Patient[];
  selectedFile: File = null;
  isLoading = false;
  isError: string = null;
  progress_percent: number = 0;
  router: string;

  constructor(private fgs: FileGeneratorService, private dataService: DataService,
    private scoreService: ScoreService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private _router: Router, private sharedService: SharedService) {

    _router.events.subscribe((event) => {
      this.router = _router.url;
    });

  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['showSnackbar'] != undefined && params['snackbarMessage'] != undefined) {
        this.sharedService.openSnackBar(params['snackbarMessage'], 'Error');
      }
    });
  }

  generateFile() {
    this.isLoading = true;
    this.fgs.createFile().subscribe(event => {

      if (event.type !== 3) {
        this.progress_percent = 0;
      }
      else if (event['type'] === 3 && event['loaded'] !== undefined && event['total'] !== undefined) {
        this.progress_percent = event['loaded'] / event['total'] * 100;
      }

      if (event.type === 4) {
        this.isLoading = false;
        this.dialog.open(DialogFileGenerationComponent, {
          width: '50vw',
          data: {
            status: event['status'],
            ok: event['ok']
          }
        });
      }

    });
  }

  importNewPatients(event) {
    this.selectedFile = <File>event.target.files[0];
    let bad_lines: string[] = [];

    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, "UTF-8");
    fileReader.onload = () => {
      try {
        let data = JSON.parse(fileReader.result.toString());
        data.forEach((element, index) => {

          let copy = this.scoreService.prepareForScoreCalculation(null, null, element);

          if (isNaN(copy._tISS28Score) || isNaN(copy._apache2Score)) {
            bad_lines.push(index);
          }
          else if (!element['_tISS28Score'] || !element['_apache2Score']) {
            element['_tISS28Score'] = copy._tISS28Score;
            element['_apache2Score'] = copy._apache2Score;
          }

        });

        data = data.filter((d, index) => { return !bad_lines.includes(index) });

        if (data.length > 0 && bad_lines.length === 0) {
          this.dataService.importPatientsFromFile(data);
        }
        else {

          let dialogRef = this.dialog.open(DialogImportErrorComponent, {
            width: '50vw',
            data: {
              bad_lines: bad_lines,
              allow_import: data.length
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
              this.dataService.importPatientsFromFile(data);
            }
          });

        }
      }
      catch (e) {
        this.dialog.open(DialogImportErrorComponent, {
          width: '50vw'
        });

        console.log(e);
      }
    }
    fileReader.onerror = (error) => {
      console.log(error);
    }

  }

  replacePatientsFromExistingFile() {
    this.dataService.parsePatientsFromFile().subscribe(results => {
      this.patients = results.patients;
    });
  }

  deletePatientsAndResults() {
    this.isLoading = true;
    this.dataService.deleteAllPatientsAndResults().subscribe(
      event => {
        if (event.type === HttpEventType.Response) {
          if (event.status === 200) {
            this.isLoading = false;

          }
        }
      },
      error => {
        this.isLoading = false;
        if (error.ok === false) {
          this.handleErrorMessage(error.status);
          console.log(error);
        }
      }
    );
  }

  private handleErrorMessage(errorCode?: number) {

    this.isLoading = false;

    if (errorCode !== undefined) {
      this.isError = 'An error has occurred while deleting patient data from server: ';
      switch (errorCode) {
        case 0:
          this.isError += 'Cannot access server data (Problem with CORS)';
          break;
        case 200:
          this.isError += 'Missing API URL';
          break;
        case 404:
          this.isError += 'Data Not Found';
          break;
        default:
          this.isError += 'Unknown Error';
      }
    }
    else {
      this.isError = 'An error has occurred while clearing the patients';
    }
  }

}
