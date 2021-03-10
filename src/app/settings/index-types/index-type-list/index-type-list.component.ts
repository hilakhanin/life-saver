import { Component, OnInit } from '@angular/core';
import { IndexType } from '../index-type.model';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { IndexTypeService } from '../index-type.service';
import { SettingService } from '../../settings.service';

@Component({
  selector: 'app-index-type-list',
  templateUrl: './index-type-list.component.html',
  styleUrls: ['./index-type-list.component.css']
})
export class IndexTypeListComponent implements OnInit {

  indexTypes: IndexType[];
  subscription: Subscription;

  constructor(private indexTypeService: IndexTypeService,
    private settingService: SettingService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscription = this.indexTypeService.indexTypesChanged
      .subscribe(
        (indexTypes: IndexType[]) => {
          this.indexTypes = indexTypes;
        }
      );
    this.indexTypes = this.indexTypeService.getIndexTypes();
  }

  onNewIndexType() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  onSaveData() {
    this.settingService.storeIndexTypes();
  }

  onFetchData() {
    this.settingService.fetchIndexTypes(false).subscribe();
    this.router.navigate(['/settings']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
