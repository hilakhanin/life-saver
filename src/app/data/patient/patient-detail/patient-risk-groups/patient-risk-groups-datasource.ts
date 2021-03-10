import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { RiskTile } from '../../../../dashboard/tiles/tile.service';

export interface PatientRiskGroupsItem {
  ruleName: string;
  riskLevel: boolean;
  patientRuleResult: number;
}

export class PatientRiskGroupsDataSource extends DataSource<PatientRiskGroupsItem> {
  data: PatientRiskGroupsItem[];
  paginator: MatPaginator;
  sort: MatSort;

  constructor(public riskTiles: RiskTile[]) {
    super();
    this.data = this.riskTiles.map(t => <PatientRiskGroupsItem>{
      ruleName: t.name,
      riskLevel: t.isHighRisk,
      patientRuleResult: t.count
    });
  }

  connect(): Observable<PatientRiskGroupsItem[]> {
    const dataMutations = [
      observableOf(this.data),
      this.paginator.page,
      this.sort.sortChange
    ];

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() { }

  private getPagedData(data: PatientRiskGroupsItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  private getSortedData(data: PatientRiskGroupsItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'ruleName': return compare(a.ruleName, b.ruleName, isAsc);
        case 'riskLevel': return compare(a.riskLevel, b.riskLevel, isAsc);
        case 'patientRuleResult': return compare(+a.patientRuleResult, +b.patientRuleResult, isAsc);
        default: return 0;
      }
    });
  }
}

function compare(a: string | number | boolean, b: string | number | boolean, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
