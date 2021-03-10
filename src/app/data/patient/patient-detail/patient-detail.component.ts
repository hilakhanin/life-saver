import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Patient } from '../../patient.model';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { PatientService } from '../../patient-list/patient.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileGeneratorService } from '../../../shared/file-generator/file-generator.service';
import * as moment from 'moment';
import { DataService } from '../../data.service';
import { categories, IndexType } from '../../../settings/index-types/index-type.model';
import { PatientResult } from '../../patient-result.model';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { DeleteResultDialogComponent } from './delete-result-dialog/delete-result-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TooltipPosition } from '@angular/material/tooltip';
import { FieldsRequiredDialogComponent } from './fields-required-dialog/fields-required-dialog.component';
import * as _ from 'underscore';
import { SharedService } from '../../../shared/shared.service';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ScoreService } from '../../../shared/score.service';


@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit, OnDestroy {

  idCard: string;
  patient: Patient;
  editMode = false;
  patientForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  panelOpenState = false;
  categories = categories;
  displayedColumns: string[] = ['IndexTypeName', 'Date', 'Result', 'Action'];
  results: PatientResult[] = [];
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  dataSource: MatTableDataSource<PatientResult>;
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[1]);
  isLoadingResults = true;
  currentRow: any;
  filteredData: IndexType[] = [];
  closed = true;
  doaSub: Subscription;
  diiSub: Subscription;


  constructor(private route: ActivatedRoute, private router: Router,
    private patientService: PatientService,
    private fileGeneratorService: FileGeneratorService,
    private dataService: DataService,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private scoreService: ScoreService) {

    this.maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 17));
    this.minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 120));

  }

  ngOnInit() {
    //TODO: page refresh messes display up. This needs to be fixed, but at a lower priority, as no use case in the application causes this behavior.
    this.route.params
      .pipe(tap((params: Params) => {
        this.detectMissingIndexTypeResults(params['id']);
      }))
      .subscribe((params: Params) => {
        this.idCard = params['id'];
        this.patient = this.patientService.getPatient(this.idCard);

        if (this.patient === undefined && this.idCard !== undefined && this.idCard.match(/\d{9}/) === null) {
          this.router.navigate(['/data'], { queryParams: { showSnackbar: true, snackbarMessage: 'A Patient with this Id Card does not exist' } });
        }

        this.editMode = params['id'] != null;

        this.initForm();
      });

    this.doaSub = this.patientForm.get('dateOfAdmission').valueChanges.subscribe(change => {
      this.patientForm.get('daysInICU').updateValueAndValidity();
    });

    this.diiSub = this.patientForm.get('dateOfBirth').valueChanges.subscribe(change => {
      this.patientForm.get('dateOfAdmission').updateValueAndValidity();
    });

  }

  ngOnDestroy() {
    if (this.doaSub) {
      this.doaSub.unsubscribe();
    }
    if (this.diiSub) {
      this.diiSub.unsubscribe();
    }
  }

  //#region Form Handling

  private initForm() {
    let id_card = '',
      is_alive = true,
      birth_date = null,
      admission_date = null,
      days_in_icu = 2,
      is_needs_dialysis = true;

    if (this.editMode) {
      id_card = this.patient.idCard;
      is_alive = this.patient.isAlive;
      birth_date = this.patient.dateOfBirth;
      admission_date = this.patient.dateOfAdmission;
      days_in_icu = this.patient.daysInICU;
      is_needs_dialysis = this.patient.isNeedsDialysis;
    }

    this.patientForm = new FormGroup({
      'idCard': new FormControl(id_card, [Validators.required, this.validateIdCard.bind(this), this.validateDuplicateIdCard.bind(this)]),
      'isAlive': new FormControl(is_alive),
      'dateOfBirth': new FormControl(birth_date, Validators.required),
      'dateOfAdmission': new FormControl(admission_date, [Validators.required, this.validateAdmissionDate.bind(this)]),
      'daysInICU': new FormControl(days_in_icu, [Validators.required, Validators.min(2), Validators.max(60), this.validateDaysInICU.bind(this)]),
      'isNeedsDialysis': new FormControl(is_needs_dialysis),
    });
  }

  onSubmit() {
    if (this.editMode) {
      this.dataService.updatePatient(this.idCard, this.patientForm.value);
    } else {
      this.patientService.addPatient(this.patientForm.value);
      this.dataService.storePatients();
    }

    this.onCancel();

  }

  onCancel() {
    this.router.navigate(['/data/patient-list'], { relativeTo: this.route });
  }

  //#endregion


  //#region Validations

  daysInICUFilter = (d: any | null): boolean => {
    return this.dateRange(d);
  }

  validateAdmissionDate(control: FormControl): { [s: string]: boolean } {
    if (control.value !== null && !this.dateRange(control.value)) {
      return { 'validAdmissionDate': true };
    }
    return null;
  }

  validateIdCard(control: FormControl): { [s: string]: boolean } {
    if (control.value !== null && this.fileGeneratorService.checkLuhn(control.value) === false) {
      return { 'validIdCard': true };
    }

    return null;
  }

  validateDuplicateIdCard(control: FormControl): { [s: string]: boolean } {
    //Leading zeros, so that '012345678' and '12345678' be considered duplicates, no matter how they were saved to DB
    let num = control.value.length === 9 && String(control.value).startsWith('0') ? String(control.value).substr(1) :
      (control.value.length === 8 ? "0" + control.value : control.value);

    if (control.value !== null &&
      (this.patientService.getPatientIndex(num) !== -1 ||
        this.patientService.getPatientIndex(control.value) !== -1)
    ) {

      if (this.editMode && this.patient && this.patient.idCard === control.value) {
        return null;
      }

      return { 'duplicateIdCard': true };
    }

    return null;
  }

  validateDaysInICU(control: FormControl): { [s: string]: boolean } {
    if (control.value !== null && (this.patientForm !== undefined && this.patientForm.get('dateOfAdmission').value !== null)) {
      let today = new Date(),
        dateOfAdmission = new Date(this.patientForm.get('dateOfAdmission').value) || (this.patientForm.get('dateOfAdmission').value).toDate(),
        dateAfterICU = new Date(dateOfAdmission.setDate(dateOfAdmission.getDate() + this.patientForm.get('daysInICU').value));

      if (dateAfterICU > today) {
        return { 'daysInICUTooLate': true };
      }
    }

    return null;
  }

  //#endregion

  //#region patient-results

  getIndexTypeResults(element) {
    this.isLoadingResults = true;

    let category = this.categories.find(c => c.Name === element).Id;

    this.dataService.fetchPatientResults(this.idCard, category)
      .subscribe(pr => {
        pr = _.sortBy(pr, function (res) { return res.IndexTypeId; });
        this.results = pr;
        this.dataSource = new MatTableDataSource(this.results);
        this.isLoadingResults = false;

      });
  }

  detectMissingIndexTypeResults(id?: string) {
    this.dataService.fetchPatientResults(this.idCard || id, undefined)
      .subscribe(pr => {
        if (id !== undefined && pr !== null) {
          let category_index_types = this.dataService.index_types.filter(it => it.CategoryId === categories[1].Id ||
            it.CategoryId === categories[2].Id),
            ids = pr.filter(ds => ds !== undefined && ds.PatientIdCard === this.idCard).map(ds => ds.IndexTypeId);

          let difference = this.sharedService.detectDifferences(category_index_types, ids);

          this.closed = difference.length > 0 && this.editMode ? false : true;

          if (this.closed && this.patient !== undefined && !this.patient.tiss28 && !this.patient.apache2) {
            let copy = this.scoreService.prepareForScoreCalculation(this.patient, pr, null);
            this.patient.tiss28 = copy._tISS28Score;
            this.patient.apache2 = copy._apache2Score;
            this.dataService.updatePatient(this.idCard, this.patient);
          }
        }
      });
  }

  addNew() {
    this.results.unshift(new PatientResult(this.idCard, '', new Date(), 0, true));
    this.dataSource = new MatTableDataSource(this.results);
    this.dataSource._updateChangeSubscription();
  }

  enableRow(element) {
    this.currentRow = JSON.parse(JSON.stringify(element));;
    element.IsEdit = true;
  }

  alertDeleteRow(element) {
    this.currentRow = element;

    let dialogRef = this.dialog.open(DeleteResultDialogComponent, {
      width: '50vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteRow(element);
      }
    });
  }

  deleteRow(element) {

    if (element.IndexTypeId !== undefined) {
      this.results.splice(this.results.findIndex(x => x.IndexTypeId === element.IndexTypeId), 1);
      this.dataService.deletePatientIndexTypeResult(element.Position).subscribe(() => {
        this.detectMissingIndexTypeResults(this.idCard);
      });
    }
    else {
      this.results.splice(0, 1);
    }

    this.dataSource = new MatTableDataSource(this.results);
    this.dataSource._updateChangeSubscription();

  }

  saveChanges(element) {
    if (element.IndexTypeName === '' || element.Date === null || element.Result === null || element.IndexTypeId === undefined) {

      this.dialog.open(FieldsRequiredDialogComponent, {
        width: '50vw'
      });

      return;
    }

    this.currentRow = null;
    element.IsEdit = false;

    this.dataService.fetchPatientResults()
      .subscribe(res => {
        this.dataService.savePatientIndexTypeResult(this.idCard, element, res.length).subscribe(() => {
          return this.detectMissingIndexTypeResults(this.idCard);
        });
      });

  }

  cancel(element) {

    if (element.IndexTypeId === undefined) {
      this.results.splice(0, 1);
    }
    else {
      let index = this.results.findIndex(r => r.IndexTypeId === element.IndexTypeId);
      this.results[index] = <PatientResult>this.currentRow;
    }

    this.dataSource = new MatTableDataSource(this.results);
    this.dataSource._updateChangeSubscription();
    this.currentRow = null;
  }

  applyFilter(evt: string, catId: number) {
    evt = evt + "";
    const allowedSelections = this.dataService.index_types
      .filter(it => {

        const id = this.results.find(r => r.IndexTypeId === it.ID) === undefined,
          cat = it.CategoryId === catId,
          // mutually exclusive
          pao2 = this.results.find(r => r.IndexTypeName === 'PaO2') ? it.Name !== '(A-a) O2' : true,
          aao2 = this.results.find(r => r.IndexTypeName === '(A-a) O2') ? it.Name !== 'PaO2' : true,
          arterialPH = this.results.find(r => r.IndexTypeName === 'Arterial PH') ? it.Name !== 'Serum HCO3-' : true,
          SerumHCO3 = this.results.find(r => r.IndexTypeName === 'Serum HCO3-') ? it.Name !== 'Arterial PH' : true;

        return id && cat && pao2 && aao2 && arterialPH && SerumHCO3;

      });

    if (!evt) this.filteredData = allowedSelections;

    else {
      const filterValue = evt.toLowerCase().split(' ');

      this.filteredData = allowedSelections
        .filter(item => filterValue.every(s => (item.ID + "").toLowerCase().includes(s)) ||
          filterValue.every(s => item.Name.toLocaleLowerCase().includes(s)));
    }
  }

  setNewRowDetails(event) {
    let indexType_to_set = this.dataService.index_types.find(it => it.ID === event.option.id);

    this.results[0].Increment = indexType_to_set.Increment;
    this.results[0].IndexTypeId = indexType_to_set.ID;
    this.results[0].IndexTypeName = indexType_to_set.Name;
    this.results[0].IsBoolean = indexType_to_set.IsBoolean;
    this.results[0].MaxValue = indexType_to_set.MaxValue;
    this.results[0].MinValue = indexType_to_set.MinValue;

    this.dataSource = new MatTableDataSource(this.results);
    this.dataSource._updateChangeSubscription();
  }

  //#endregion

  //#region helpers

  dateRange(d: any | null) {
    if (this.patient !== undefined || (this.patientForm !== undefined && this.patientForm.get('dateOfBirth').value !== null)) {
      let today = new Date(),
        birthDate = this.patient ? new Date(this.patient.dateOfBirth) : new Date(this.patientForm.get('dateOfBirth').value),
        age17Date = new Date(birthDate.getFullYear() + 17, birthDate.getMonth(), birthDate.getDate()),
        age120Date = new Date(birthDate.getFullYear() + 120, birthDate.getMonth(), birthDate.getDate()),
        two_days_ago = new Date(new Date().setDate(today.getDate() - 2)),
        max = new Date(Math.min.apply(null, [age120Date, two_days_ago])),
        min = new Date(Math.min.apply(null, [age17Date, two_days_ago])),
        admission_date = moment(d).toDate();

      return admission_date >= min && admission_date <= max;
    }

    return Math.round(Math.floor((new Date().getTime() - (moment(d).toDate()).getTime()) / (24 * 60 * 60 * 1000))) > 2;
  }

  //#endregion
}
