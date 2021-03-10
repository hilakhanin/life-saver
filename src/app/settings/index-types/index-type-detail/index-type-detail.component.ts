import { Component, OnInit } from '@angular/core';
import { IndexType } from '../index-type.model';
import { IndexTypeService } from '../index-type.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-index-type-detail',
  templateUrl: './index-type-detail.component.html',
  styleUrls: ['./index-type-detail.component.css']
})
export class IndexTypeDetailComponent implements OnInit {

  indexType: IndexType;
  id: number;

  constructor(private indexTypeService: IndexTypeService,
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService) {
  }

  ngOnInit() {
    this.translateService.get('app.snackbars')
      .subscribe();

    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.indexType = this.indexTypeService.getIndexType(this.id);

          if (this.indexType === undefined) {
            this.router.navigate(['/settings'], { queryParams: { showSnackbar: true, snackbarMessage: this.translateService.instant('app.snackbars.noIndexType') } });
          }
        }
      );
  }

  onEditIndexType() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onDeleteIndexType() {
    this.indexTypeService.deleteIndexType(this.id);
    this.router.navigate(['/settings']);
  }
}
