import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FormulaService } from './formula.service';
import { Rule } from './rule.model';
import { RulesService } from './rules.service';

@Injectable({
  providedIn: 'root'
})
export class RulesResolverService implements Resolve<Rule[]> {

  constructor(
    private rulesService: RulesService,
    private formulaService: FormulaService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Rule[]> | Promise<Rule[]> | Rule[] {
    const formula = this.formulaService.getRules();

    if (formula && formula.length === 0) {
      return this.rulesService.fetchRules();
    } else {
      return formula;
    }
  }
}
