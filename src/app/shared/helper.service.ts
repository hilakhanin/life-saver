import { Injectable } from '@angular/core';
import { ChartApi } from '../dashboard/chart/chart.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  calculateAge(birthDate: Date) {
    const today = new Date(),
      birth_date = new Date(birthDate);
    let age = today.getFullYear() - birth_date.getFullYear(),
      m = today.getMonth() - birth_date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth_date.getDate())) {
      age--;
    }

    return age;
  }

  sortByProperty(property) {
    return function (a, b) {
      if (typeof a[property] == "number") {
        return (a[property] - b[property]);
      }
      else if (a[property] instanceof Date) {
        return (a[property].getTime() - b[property].getTime());
      }
      else {
        return ((a[property] < b[property]) ? -1 : ((a[property] > b[property]) ? 1 : 0));
      }
    };
  }

  // This transforms this object's key names to lowercase, for comparison purposes
  modifyPropertyForFiltering(res: ChartApi[]) {
    return res.map(r => r.patient)
      .map(item => {
        for (let key in item) {
          let lower = key.toLowerCase();
          if (lower !== key) {
            item[lower] = item[key];
            delete item[key];
          }
        }
        return item;
      });
  }

  decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt|lcub|rcub|Sigma|Pi|radic|pi);/g;
    var translate = {
      "nbsp": " ",
      "amp": "&",
      "quot": "\"",
      "lt": "<",
      "gt": ">",
      "lcub": "{",
      "rcub": "}",
      "Sigma": "Σ",
      "Pi": "Π",
      "radic": "√",
      "pi": "π"
    };
    return encodedString.replace(translate_re, function (entity) {
      return translate[entity.replace(/&|;/g, '')];
    }).replace(/&#(\d+);/gi, function (numStr) {
      var num = parseInt(numStr.match(/\d+/g), 10);
      return String.fromCharCode(num);
    });
  }
}
