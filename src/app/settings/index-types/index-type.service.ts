import { Injectable } from '@angular/core';
import { IndexType } from './index-type.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndexTypeService {

  private indexTypes: IndexType[] = [];
  indexTypesChanged = new Subject<IndexType[]>();

  constructor() { }

  setIndexTypes(indexTypes: IndexType[]) {
    this.indexTypes = indexTypes;
    this.indexTypesChanged.next(this.indexTypes ? this.indexTypes.slice() : this.indexTypes);
  }

  getIndexTypes() {
    return this.indexTypes ? this.indexTypes.slice() : this.indexTypes;
  }

  getIndexType(index: number) {
    return this.indexTypes ? this.indexTypes[index] : null;
  }

  addIndexType(indexType: IndexType) {
    this.indexTypes.push(indexType);
    this.indexTypesChanged.next(this.indexTypes.slice());
  }

  updateIndexType(index: number, newIndexType: IndexType) {
    this.indexTypes[index] = newIndexType;
    this.indexTypesChanged.next(this.indexTypes.slice());
  }

  deleteIndexType(index: number) {
    this.indexTypes.splice(index, 1);
    this.indexTypesChanged.next(this.indexTypes.slice());
  }
}
