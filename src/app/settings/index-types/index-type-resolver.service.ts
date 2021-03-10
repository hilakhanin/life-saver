import { Injectable } from '@angular/core';
import { IndexType } from './index-type.model';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { IndexTypeService } from './index-type.service';
import { SettingService } from '../settings.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndexTypeResolverService implements Resolve<IndexType[]> {

  constructor(
    private settingService: SettingService,
    private indexTypesService: IndexTypeService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IndexType[]> | Promise<IndexType[]> | IndexType[] {
    const indexTypes = this.indexTypesService.getIndexTypes();

    if (indexTypes && indexTypes.length === 0) {
      return this.settingService.fetchIndexTypes();
    } else {
      return indexTypes;
    }
  }
}
