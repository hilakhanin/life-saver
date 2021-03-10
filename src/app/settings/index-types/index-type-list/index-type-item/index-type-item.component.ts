import { Component, Input } from '@angular/core';
import { IndexType } from '../../index-type.model';

@Component({
  selector: 'app-index-type-item',
  templateUrl: './index-type-item.component.html',
  styleUrls: ['./index-type-item.component.css']
})
export class IndexTypeItemComponent {

  @Input() indexType: IndexType;
  @Input() index: number;

}
