import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../data/patient-list/patient.service';
import { FormulaService } from '../../rules/formula.service';
import { Rule } from '../../rules/rule.model';
import { RiskTile, TileService } from './tile.service';

@Component({
  selector: 'app-tiles',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.css']
})
export class TilesComponent implements OnInit {

  leftTile: RiskTile = <RiskTile>{
    isHighRisk: null,
    count: 0,
    name: 'Calculating...'
  };
  rightTile: RiskTile = <RiskTile>{
    isHighRisk: null,
    count: 0,
    name: 'Calculating...'
  };


  constructor(private patientService: PatientService,
    private formulaService: FormulaService,
    private tileService: TileService) { }

  ngOnInit() {
    this.getRuleConfig();
  }

  countPatients(): number {
    return this.patientService.getAllPatients() !== null ? this.patientService.getAllPatients().length : 0;
  }

  getRuleConfig() {
    const ruleConfig = JSON.parse(localStorage.getItem("ruleConfig"))?.ruleConfig;
    let ruleList: Rule[] = [];

    if (ruleConfig) {
      let rules = this.formulaService.getUglyRules();

      ruleList = rules ? rules
        .filter(r => Object.values(ruleConfig).includes(r.Id)) : ruleList;

      if (Object.values(ruleConfig)[0] > Object.values(ruleConfig)[1]) { // To maintain correct left and right tile positions
        ruleList.reverse();
      }

      this.tileService.getRuleConfig(ruleList).subscribe(res => {

        switch (ruleList.length) {
          case 1:
            this.leftTile = res[0];
            this.rightTile = res[1];
            break;
          case 2:
            this.leftTile = res[0];
            this.rightTile = res[2];
            break;
          default: // Both selected as None
            this.leftTile = res[0];
            this.rightTile = res[1];
        }

      });
    }
    else {
      this.tileService.getRuleConfig(ruleList).subscribe(res => {
        this.leftTile = res[0];
        this.rightTile = res[1];
      });
    }

  }

}

  //TODO: Add method for connected users
