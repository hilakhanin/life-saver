import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Subject } from 'rxjs';
import { RiskTile, TileService } from '../../../../dashboard/tiles/tile.service';
import { FormulaService } from '../../../../rules/formula.service';
import { Rule } from '../../../../rules/rule.model';
import { PatientRiskGroupsDataSource, PatientRiskGroupsItem } from './patient-risk-groups-datasource';

@Component({
  selector: 'app-patient-risk-groups',
  templateUrl: './patient-risk-groups.component.html',
  styleUrls: ['./patient-risk-groups.component.css']
})
export class PatientRiskGroupsComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<PatientRiskGroupsItem>;
  dataSource: PatientRiskGroupsDataSource;

  displayedColumns = ['ruleName', 'riskLevel', 'patientRuleResult'];

  @Input() patientIndex?: number;
  isShowRuleTable: boolean = false;
  riskTiles: RiskTile[] = [];
  subject = new Subject<RiskTile[]>();


  constructor(private formulaService: FormulaService, private tileService: TileService) { }

  ngOnInit() {
    let ruleList: Rule[] = this.formulaService.getUglyRules();
    ruleList = ruleList != null ? ruleList : [];

    this.tileService.getRuleConfig(ruleList, this.patientIndex).subscribe(res => {
      this.riskTiles = res;
      this.subject.next(this.riskTiles);
      this.isShowRuleTable = res.length > 0;
    });

    this.subject.subscribe(res => {
      this.dataSource = new PatientRiskGroupsDataSource(res);
    });
  }

  ngAfterViewInit() {
    this.subject.subscribe(res => {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;
    });
  }
}
