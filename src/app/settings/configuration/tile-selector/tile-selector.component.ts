import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Rule } from '../../../rules/rule.model';
import { RulesService } from '../../../rules/rules.service';

@Component({
  selector: 'app-tile-selector',
  templateUrl: './tile-selector.component.html',
  styleUrls: ['./tile-selector.component.css']
})
export class TileSelectorComponent implements OnInit, OnChanges {

  @Input() side: string;
  @Input() selfIndex?: number;
  @Input() otherIndex?: number;
  @Output() ruleSelected = new EventEmitter<number>();

  ruleList: Rule[];
  filteredRuleList: Rule[] = [];

  constructor(private rulesService: RulesService) { }

  ngOnInit() {
    this.rulesService.fetchRules().subscribe(res => {
      this.ruleList = res.filter(r => r.IsActive == true);
      this.filteredRuleList = this.ruleList.filter(r => r.Id != this.otherIndex);
      this.selfIndex = this.selfIndex >= 0 ? this.selfIndex : -1;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['otherIndex'] && this.ruleList) {
      this.filteredRuleList = this.ruleList.filter(r => r.Id != this.otherIndex);
    }
  }

  onChange(event) {
    this.ruleSelected.emit(event);
  }
}
