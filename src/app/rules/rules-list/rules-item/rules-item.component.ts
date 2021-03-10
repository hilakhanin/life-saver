import { Component, Input } from '@angular/core';
import { Rule } from '../../rule.model';

@Component({
  selector: 'app-rules-item',
  templateUrl: './rules-item.component.html',
  styleUrls: ['./rules-item.component.css']
})
export class RulesItemComponent {

  @Input() rule: Rule;
  @Input() index: number;

}
