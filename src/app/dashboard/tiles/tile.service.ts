import { Injectable } from '@angular/core';
import { Rule } from '../../rules/rule.model';
import { SettingService } from '../../settings/settings.service';
import { ChartApi, ChartService } from '../chart/chart.service';
import { evaluate } from 'mathjs';
import { Observable, Subject } from 'rxjs';

export interface RiskTile {
  isHighRisk?: boolean;
  count: number;
  name: string;
}
export const binaryLogisticRegression = {
  equation: "(1/3 * {{ -2 }} + 2/3 * {{ -1 }}) / 3",
  cutoff: 12
};

@Injectable({
  providedIn: 'root'
})
export class TileService {

  riskTiles: RiskTile[] = [];


  constructor(private chartService: ChartService,
    private settingService: SettingService) { }

  getRuleConfig(ruleList: Rule[], patientId?: number): Observable<RiskTile[]> {
    let subject = new Subject<RiskTile[]>();
    this.chartService.patientData().subscribe(patientData => {
      const regex = /({{.*?}})/ig,
        curlyBrackets = /({{|}})/ig;

      patientData = patientId ? patientData.filter(pd => +pd.patient.idCard == patientId) : patientData;
      this.riskTiles = [];

      if (ruleList && ruleList.length > 0) {
        this.countAtRiskPatients(patientData, ruleList, regex, curlyBrackets, patientId)
          .then(() => {
            //TODO: this does not update outside
            subject.next(this.riskTiles);
          });
      }
      else {
        this.useDefaultEquation(patientData, ruleList, regex, curlyBrackets, patientId)
          .then(() => {
            //TODO: this does not update outside
            subject.next(this.riskTiles);
          });
      }

    });

    return subject.asObservable();
  }

  evaluateSingleResult(equation: string, patientResult: ChartApi, regex: RegExp, curlyBrackets: RegExp) {
    try {
      let result = evaluate(equation.replace(regex, value => {
        value = value.replace(curlyBrackets, "").trim();
        if (+value < 0) {
          let key = this.settingService.indexTypeList.find(i => i.ID == +value).Marking.toLowerCase();

          return patientResult.patient[Object.keys(patientResult.patient).find(k => k.toLowerCase() === key.toLowerCase())];
        }

        return patientResult.results.find(r => r.indexTypeId == +value).result;
      }));

      return Promise.resolve(+result);
      // return result;
    }
    catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }

  async handleEvaluation(equation: string, chartApi: ChartApi, regex: RegExp, curlyBrackets: RegExp) {
    try {
      const response = await this.evaluateSingleResult(equation, chartApi, regex, curlyBrackets);
      return response;
    }
    catch (err) {
      console.log(err);
    }
  }

  async countAtRiskPatients(patientData: ChartApi[], ruleList: Rule[] = [], regex: RegExp, curlyBrackets: RegExp, patientId?: number) {
    let indexTypeIds: number[] = [];

    await ruleList.forEach(rule => {
      indexTypeIds = [];
      indexTypeIds.push(...rule.Equation.match(regex).map(match => {
        return +match.replace(curlyBrackets, "").trim();
      }));

      indexTypeIds = [...new Set(indexTypeIds)].filter(id => id > 0);

      let highRisk = 0,
        lowRisk = 0;

      patientData.forEach((chartApi, index, array) => {

        if (indexTypeIds.every(i => chartApi.results.find(r => r.indexTypeId == i))) {
          // let patientResult = this.evaluateSingleResult(rule.Equation, chartApi, regex, curlyBrackets);

          this.handleEvaluation(rule.Equation, chartApi, regex, curlyBrackets)
            .then(patientResult => {
              if (patientResult < rule.Cutoff) {
                lowRisk = patientId ? patientResult : ++lowRisk;
                if (patientId) {
                  this.riskTiles.push({
                    isHighRisk: false,
                    count: lowRisk,
                    name: rule.Name
                  });
                }
              }
              else {
                highRisk = patientId ? patientResult : ++highRisk;
                if (patientId) {
                  this.riskTiles.push({
                    isHighRisk: true,
                    count: highRisk,
                    name: rule.Name
                  });
                }
              }
            });

          // if (patientResult <= rule.Cutoff) {
          //   lowRisk = patientId ? patientResult : ++lowRisk;
          //   if (patientId) {
          //     this.riskTiles.push({
          //       isHighRisk: false,
          //       count: lowRisk,
          //       name: rule.Name
          //     });
          //   }
          // }
          // else {
          //   highRisk = patientId ? patientResult : ++highRisk;
          //   if (patientId) {
          //     this.riskTiles.push({
          //       isHighRisk: true,
          //       count: highRisk,
          //       name: rule.Name
          //     });
          //   }
          // }
        }
      });

      if (!patientId) {
        this.riskTiles.push({
          isHighRisk: true,
          count: highRisk,
          name: rule.Name
        });
        this.riskTiles.push({
          isHighRisk: false,
          count: lowRisk,
          name: rule.Name
        });
      }
    });
  }

  async useDefaultEquation(patientData: ChartApi[], ruleList: Rule[] = [], regex: RegExp, curlyBrackets: RegExp, patientId?: number) {
    ruleList.push(new Rule(-1, "Binary Logistic Regression", binaryLogisticRegression.equation, binaryLogisticRegression.cutoff, true, -1))
    await this.countAtRiskPatients(patientData, ruleList, regex, curlyBrackets, patientId);
  }
}
