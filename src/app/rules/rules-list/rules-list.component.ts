import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormulaService } from '../formula.service';
import { Rule } from '../rule.model';
import { RulesService } from '../rules.service';

@Component({
  selector: 'app-rules-list',
  templateUrl: './rules-list.component.html',
  styleUrls: ['./rules-list.component.css']
})
export class RulesListComponent implements OnInit {

  rules: Rule[];
  subscription: Subscription;

  constructor(private rulesService: RulesService,
    private formulaService: FormulaService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.subscription = this.formulaService.rulesChanged
      .subscribe(
        (rules: Rule[]) => {
          this.rules = rules;
        }
      );
    this.rules = this.formulaService.getRules();
  }

  onNewRule() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  onSaveData() {
    this.rulesService.storeRules();
  }

  onFetchData() {
    this.rulesService.fetchRules().subscribe();
    this.router.navigate(['/rules']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
