import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Rule } from './rule.model';

@Injectable({
  providedIn: 'root'
})
export class FormulaService {

  private rules: Rule[] = [];
  rulesChanged = new Subject<Rule[]>();
  private uglyRules: Rule[] = [];


  constructor() { }

  getRules() {
    return this.rules ? this.rules.slice() : this.rules;
  }

  setRules(rules: Rule[]) {
    this.rules = rules;
    this.rulesChanged.next(this.rules ? this.rules.slice() : this.rules);
  }

  addRule(rule: Rule) {
    this.rules = this.rules || [];
    this.rules.push(rule);
    this.rulesChanged.next(this.rules.slice());
  }

  getRule(index: number) {
    return this.rules ? this.rules[index] : null;
  }

  deleteRule(index: number) {
    this.rules.splice(index, 1);
    this.rulesChanged.next(this.rules.slice());
  }

  updateRule(index: number, newRule: Rule) {
    this.rules[index] = newRule;
    this.rulesChanged.next(this.rules.slice());
  }

  setUglyRules(rules: Rule[]) {
    this.uglyRules = rules;
  }

  getUglyRules() {
    return this.uglyRules ? this.uglyRules.slice() : this.uglyRules;
  }
}
