import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { IndexType } from '../settings/index-types/index-type.model';
import { SharedService } from '../shared/shared.service';
import { FormulaService } from './formula.service';
import { Rule } from './rule.model';

@Injectable({
  providedIn: 'root'
})
export class RulesService {

  index_types: IndexType[] = [];

  constructor(private http: HttpClient, private formulaService: FormulaService, private sharedService: SharedService) { }

  storeRules() {
    const rules = this.formulaService.getRules();

    let copy = rules.map(object => ({ ...object }));
    copy.forEach(rule => {
      rule.Equation = this.sharedService.writeToHiddenEquationString(rule.Equation, this.index_types, '');
      return rule;
    });

    this.http
      .put('https://life-saver-backend.firebaseio.com/rules.json',
        copy
      )
      .subscribe(response => {
        console.log(response);
      });
  }

  fetchRules() {
    return this.http
      .get<IndexType[]>('https://life-saver-backend.firebaseio.com/indexTypes.json')
      .pipe(
        tap(res => {
          this.index_types = res;
        }),
        switchMap(() => this.http
          .get<Rule[]>('https://life-saver-backend.firebaseio.com/rules.json')),
        map(rules => {
          rules != null ? rules.filter(r => r != null) : rules;
          return rules;
        }),
        catchError(this.sharedService.handleError),
        tap(rules => {
          let temp = JSON.parse(JSON.stringify(rules)); //Reminder for future me: this is for copying by value and not by reference
          this.formulaService.setRules(this.sharedService.extractIndexTypes(temp, this.index_types));

          this.formulaService.setUglyRules(rules);
        })
      );
  }
}
