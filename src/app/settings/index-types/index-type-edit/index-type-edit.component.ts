import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { IndexTypeService } from '../index-type.service';
import { MeasurementUnitEnum } from '../measurement-unit.enum';
import { NgForm } from '@angular/forms';
import { IndexType, categories } from '../index-type.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-index-type-edit',
  templateUrl: './index-type-edit.component.html',
  styleUrls: ['./index-type-edit.component.css']
})
export class IndexTypeEditComponent implements OnInit {

  id: number;
  indexType: IndexType;
  editMode = false;
  keys = Object.keys;
  unitsOfMeasurement = MeasurementUnitEnum;
  categories = categories;
  isBooleanSelect = [{ name: 'Boolean', value: 'true', selected: false }, { name: 'Range', value: 'false', selected: false }];
  selectedUnit = '';
  selectedCategory = -1;
  radioSelected: string;

  @ViewChild('f') indexTypeForm: NgForm;

  constructor(
    private route: ActivatedRoute,
    private indexTypeService: IndexTypeService,
    private router: Router,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    //TODO: verify all snackbars
    this.translateService.get('app.snackbars')
      .subscribe();

    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.indexType = this.indexTypeService.getIndexType(this.id);

      if (this.indexType === undefined && this.id > 0) {
        this.router.navigate(['/settings'], { queryParams: { showSnackbar: true, snackbarMessage: this.translateService.instant('app.snackbars.noIndexType') } });
      }

      this.editMode = params['id'] != null;
      this.selectedUnit = this.indexType != undefined ? Object.keys(this.unitsOfMeasurement)
        .find(key => this.unitsOfMeasurement[key] === this.indexType.UnitOfMeasurement || this.unitsOfMeasurement[key] === 'None')
        : '';
      this.selectedCategory = this.indexType != undefined ?
        this.categories.find(({ Id }) => Id == this.indexType.CategoryId).Id :
        -1;

      this.radioSelected = this.indexType != undefined ? (this.indexType.IsBoolean ? this.isBooleanSelect[0].name : this.isBooleanSelect[1].name) : '';

    });
  }

  onSubmit() {

    this.indexType = new IndexType(this.id,
      this.indexTypeForm.value.name,
      this.indexTypeForm.value.minValue,
      this.indexTypeForm.value.maxValue,
      this.indexTypeForm.value.unitOfMeasurement,
      this.indexTypeForm.value.booleanRadios === 'Boolean',
      this.indexTypeForm.value.increment,
      this.indexTypeForm.value.category,
      null);
    if (this.editMode) {
      this.indexTypeService.updateIndexType(this.id, this.indexType);
    } else {
      const index_types = this.indexTypeService.getIndexTypes();
      this.indexType.ID = index_types ? ++index_types.length : 0;
      this.indexType.Marking = this.indexType.Name.split(' ').join('');
      this.indexTypeService.addIndexType(this.indexType);
    }
    this.onCancel();
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
