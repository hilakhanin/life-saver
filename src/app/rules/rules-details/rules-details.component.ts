import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormulaService } from '../formula.service';
import { Rule } from '../rule.model';

@Component({
  selector: 'app-rules-details',
  templateUrl: './rules-details.component.html',
  styleUrls: ['./rules-details.component.css']
})
export class RulesDetailsComponent implements OnInit {

  rule: Rule;
  id: number;

  constructor(private formulaService: FormulaService,
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService) { }

  ngOnInit() {

    this.translateService.get('app.snackbars')
      .subscribe();

    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.rule = this.formulaService.getRule(this.id);

          if (this.rule === undefined && this.id > 0) {
            this.router.navigate(['/rules'], { queryParams: { showSnackbar: true, snackbarMessage: this.translateService.instant('app.snackbars.noRule') } });
          }
        }
      );
  }

  onEditRule() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onDeleteRule() {
    this.formulaService.deleteRule(this.id);
    this.router.navigate(['/rules']);
  }
}
