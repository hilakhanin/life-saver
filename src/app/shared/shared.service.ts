import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject, throwError } from 'rxjs';
import { ChartApi } from '../dashboard/chart/chart.service';
import { Graph } from '../dashboard/graph-list/graph.model';
import { PatientIndexTypeResult } from '../data/patientIndexTypeResult.model';
import { Rule } from '../rules/rule.model';
import { IndexType, mutually_exclusive } from '../settings/index-types/index-type.model';
import { ChronicOrganInsufficiencyEnum } from './file-generator/chronic-organ-insufficiency.enum';
import { EndStageDiseaseEnum } from './file-generator/end-stage-disease.enum';
import { HelperService } from './helper.service';

export const dates = {
  'MIN_VALUE': -8640000000000000,
  'MAX_VALUE': 8640000000000000
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  isError = new Subject<boolean>();


  constructor(private helperService: HelperService,
    private _snackBar: MatSnackBar,
    private translateService: TranslateService) {
    this.translateService.get('app')
      .subscribe();
  }

  detectDifferences(category_index_types: IndexType[], patient_index_types: number[]) {
    let difference = category_index_types.filter(x => !patient_index_types.includes(x.ID) && x.Name !== 'Age');

    mutually_exclusive.forEach(pair => {
      let first = difference.findIndex(d => d.Marking === pair[0]),
        second = difference.findIndex(d => d.Marking === pair[1]);

      if (first > -1) {
        difference.splice(first, 1);
      }
      else if (second > -1) {
        difference.splice(second, 1);
      }

    });

    return difference;
  }

  handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An error occurred!';
    console.log(errorRes);
    return throwError(errorMessage);
  }

  chronicOrganInsufficiency(chronicOrganInsufficiency: string) {
    switch (chronicOrganInsufficiency) {
      case ChronicOrganInsufficiencyEnum[0]: // None
        return 0;
      case ChronicOrganInsufficiencyEnum[1]: // NonOperative
      case ChronicOrganInsufficiencyEnum[2]: // EmergencyPostOperative
        return 5;
      case ChronicOrganInsufficiencyEnum[3]: // ElectivePostOperative
        return 2;
    }
  }

  calculateStorageForChart(graph: Graph, res: ChartApi[], index_types: IndexType[]) {
    let axisX = index_types.find(s => s.ID == graph.AxisXId).Marking.toLowerCase(),
      axisY = index_types.find(s => s.ID == graph.AxisYId).Marking.toLowerCase(),
      patients = this.helperService.modifyPropertyForFiltering(res),
      axisXresults = ([] as PatientIndexTypeResult[]).concat(...res.map(m => m.results.filter(f => f.indexTypeId == graph.AxisXId))),
      axisYresults = ([] as PatientIndexTypeResult[]).concat(...res.map(m => m.results.filter(f => f.indexTypeId == graph.AxisYId)));

    let storage = patients.map(r => {
      return {
        x: r[axisX] ? r[axisX] : +axisXresults.filter(f => f.patientIdCard == r['idcard']).map(m => m.result),
        y: r[axisY] ? r[axisY] : +axisYresults.filter(f => f.patientIdCard == r['idcard']).map(m => {
          if (!isNaN(m.result)) {
            return +m.result;
          }

          switch (index_types.find(s => s.ID == graph.AxisYId).Marking) {
            case 'ChronicOrganInsufficiency':
              return this.chronicOrganInsufficiency(m.result);
            case 'EndStageDisease':
              return EndStageDiseaseEnum[m.result];
          }

        })
      }
    });

    return storage;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
    });
  }

  extractIndexTypes(rules: Rule[], index_types: IndexType[]) {
    if (rules != null) {
      let regex = /({{\s*-?\d+\s*}})/ig,
        numberRegex = /-?\d+/ig;

      try {
        rules.forEach(rule => {
          rule.Equation = rule.Equation.replace(regex, (element) => {

            return element.replace(numberRegex, (num) => {
              return index_types.find(i => i.ID == +num).Name;
            });
          });
        });
      }
      catch (e) {
        console.log(e);
      }
      finally {
        return rules;
      }
    }

    return rules;
  }

  writeToHiddenEquationString(str: string, index_types: IndexType[], hiddenEquationString: string) {
    const regex = /({{.*?}})/ig,
      curlyBrackets = /({{|}})/ig;

    if (str != "" && index_types.length > 0) {
      let search_arr = regex.exec(str);
      if (search_arr != null) {
        hiddenEquationString += str.substring(0, search_arr['index']);

        hiddenEquationString += this.translateService.instant('app.rules.elementId', {
          name: index_types.find(i => i.Name === search_arr[0]
            .replace(curlyBrackets, "").trim()).ID
        });

        let sub = str.substring(search_arr['index'] + search_arr[0].length, str.length + 1);
        if (sub != "") {
          hiddenEquationString = this.writeToHiddenEquationString(sub, index_types, hiddenEquationString);
        }
      }
      else {
        hiddenEquationString += str;
      }
    }
    else {
      hiddenEquationString = '';
    }

    return hiddenEquationString;
  }
}
