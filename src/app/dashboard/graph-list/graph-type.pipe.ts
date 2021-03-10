import { Pipe, PipeTransform } from '@angular/core';
import { graphTypes } from './graph.model';

@Pipe({
  name: 'graphType'
})
export class GraphTypePipe implements PipeTransform {

  transform(value: number): string {
    return graphTypes[value] ? graphTypes[value].Name : '';
  }

}
