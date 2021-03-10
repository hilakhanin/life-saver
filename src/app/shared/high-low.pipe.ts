import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highLow'
})
export class HighLowPipe implements PipeTransform {

  transform(value: boolean): string {
    return value ? "High" : "Low";
  }

}
