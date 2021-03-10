import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { graphTypes } from '../graph.model';
import { IndexType } from '../../../settings/index-types/index-type.model';
import { SettingService } from '../../../settings/settings.service';
import { merge, ReplaySubject } from 'rxjs';
import { DeleteGraphDialogComponent } from '../delete-graph-dialog/delete-graph-dialog.component';
import { takeUntil, tap } from 'rxjs/operators';
import { dates } from '../../../shared/shared.service';


@Component({
  selector: 'app-graph-dialog',
  templateUrl: './graph-dialog.component.html',
  styleUrls: ['./graph-dialog.component.css']
})
export class GraphDialogComponent implements OnInit, OnDestroy {

  graphForm: FormGroup;
  graphTypes = graphTypes;
  index_types: IndexType[];
  destroy: ReplaySubject<any> = new ReplaySubject<any>(1); // to emit the last message in case the subscription is ended after the component is destroyed

  constructor(public dialogRef: MatDialogRef<GraphDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private settingService: SettingService,
    private dialog: MatDialog) {
    this.settingService.fetchIndexTypes(true).subscribe(res => {
      this.index_types = res;
    });
  }

  ngOnInit() {

    this.initForm();

    this.graphForm.get('axes.axisX').valueChanges
      .pipe(
        tap(option => {
          this.graphForm.get('isBoolean').setValue(this.index_types.find(i => i.ID == option).IsBoolean);
        }),
        takeUntil(this.destroy)
      )
      .subscribe();

    merge(this.graphForm.get('axes').valueChanges, this.graphForm.get('types').valueChanges)
      .pipe(
        tap(() => {

          const type = this.graphForm.get('types').value;
          if (type != 2) {
            if (type != 2) {
              this.graphForm.get('axes.axisY').setValidators(Validators.required);
              this.graphForm.get('axes').setValidators(this.validateDifferentAxes);
            }
            if (type == 1) { // because of this.index_types, this has to happen after the constructor, hence this subscription
              this.graphForm.get('axes').setValidators(this.validateAxisForBarChart(this.index_types));
            }
            if (type == 0) {
              this.graphForm.get('axes').setValidators(this.validateAxisForScatterPlotChart(this.index_types));
            }
          }
          else if (type == 2 && !this.graphForm.get('isBoolean').value) {
            this.graphForm.get('axes').setValidators(this.validateAxisForPieChart);
          }
          else {
            this.graphForm.get('axes').clearValidators();
          }
          this.graphForm.get('axes').updateValueAndValidity({ emitEvent: false });
        }),
        takeUntil(this.destroy)
      )
      .subscribe();

  }

  private initForm() {
    this.graphForm = new FormGroup({
      'id': new FormControl(this.data.graph ? this.data.graph.Id : null),
      'name': new FormControl(this.data.graph ? this.data.graph.Name : null, Validators.required),
      'types': new FormControl(this.data.graph ? this.data.graph.TypeId : null, Validators.required),
      'isBoolean': new FormControl(this.data.graph ? this.data.graph.IsBoolean : null),
      'axes': new FormGroup({
        'axisX': new FormControl(this.data.graph ? this.data.graph.AxisXId : null, Validators.required),
        'axisY': new FormControl(this.data.graph ? (this.data.graph.AxisYId == 0 ? null : this.data.graph.AxisYId) : null)
      }),
      'position': new FormControl(this.data.graph ? this.data.graph.Position : null)
    });
  }

  confirmDelete() {
    let deleteDialogRef = this.dialog.open(DeleteGraphDialogComponent, {
      width: '50vw'
    });

    deleteDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close({ graphToDelete: this.dialogRef.componentInstance.data.graph.Id });
      }
    });
  }

  onSubmit() {
    this.dialogRef.close({ data: this.graphForm });
  }

  ngOnDestroy() {
    this.destroy.next(null);
  }

  //#region Validators

  validateDifferentAxes(axesGroup: FormGroup): { [s: string]: boolean } {
    if (axesGroup.get('axisX').value && axesGroup.get('axisY').value && axesGroup.get('axisX').value == axesGroup.get('axisY').value) {
      return { 'axesXAndYAreTheSame': true };
    }

    return null;
  }

  //If Bar Chart is selected, then axis X needs to be boolean and axis Y needs to not be boolean
  validateAxisForBarChart(indexTypes: IndexType[]) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const x = indexTypes.find(i => i.ID == control.get('axisX').value),
        y = indexTypes.find(i => i.ID == control.get('axisY').value),
        isXBoolean = (x && x.IsBoolean),
        isYBoolean = (y && y.IsBoolean);

      if ((x && y) && !(isXBoolean == true && isYBoolean == false)) {
        return { 'xNotBooleanOrYIsBoolean': true };
      }

      if ((x && y) &&
        (x.MinValue == dates.MIN_VALUE || x.MaxValue == dates.MAX_VALUE ||
          y.MinValue == dates.MIN_VALUE || y.MaxValue == dates.MAX_VALUE)) {
        return { 'barChartAxisCannotBeDates': true };
      }

      return null;
    }
  }

  validateAxisForPieChart(): { [s: string]: boolean } {
    return { 'pieChartAxisMustBeBoolean': true };
  }

  validateAxisForScatterPlotChart(indexTypes: IndexType[]) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const x = indexTypes.find(i => i.ID == control.get('axisX').value),
        y = indexTypes.find(i => i.ID == control.get('axisY').value);

      //TODO: bug fix: an exception is thrown when the user has first selected X and not yet selected Y (i.e., scatter plot)
      if ((x || y) &&
        (x.MinValue == dates.MIN_VALUE || x.MaxValue == dates.MAX_VALUE ||
          y.MinValue == dates.MIN_VALUE || y.MaxValue == dates.MAX_VALUE)) {
        return { 'scatterPlotChartAxisCannotBeDates': true };
      }

      return null;
    }
  }

  /*TODO: maybe try to figure out a reusable function for this sort of validator that receives a callback , as it seems repetitive
  Something along the lines of:
  conditionalValidator(predicate, validator) {
  return (formControl => {
    if (!formControl.parent) {
      return null;
    }
    if (predicate()) {
      return validator(formControl); 
    }
    return null;
  })
}
  */

  //#endregion Validators

}
