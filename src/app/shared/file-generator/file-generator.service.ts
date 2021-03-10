import { Injectable } from '@angular/core';
import { EndStageDiseaseEnum } from './end-stage-disease.enum';
import { FileRow } from './file-row.model';
import { ChronicOrganInsufficiencyEnum } from './chronic-organ-insufficiency.enum';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ScoreService } from '../score.service';
import { SharedService } from '../shared.service';

@Injectable({
  providedIn: 'root'
})
export class FileGeneratorService {

  constructor(private http: HttpClient, private scoreService: ScoreService, private sharedService: SharedService) { }

  /*Due to medical privacy issues, instead of using a real input file when running the application for the first time,
  I've generated a similar fake one */
  createFile() {
    let file_rows: FileRow[] = [];
    while (file_rows.length < 250) {
      let fr = this.createFileRow();
      fr._tISS28Score = this.scoreService.calculateTISS28Score(fr);
      fr._apache2Score = this.scoreService.calculateApache2Score(fr);
      if (fr._tISS28Score != null && fr._apache2Score != null) {
        file_rows.push(fr);
      }
    }

    return this.http.put('https://life-saver-backend.firebaseio.com/fileRows.json', JSON.stringify(file_rows), {
      reportProgress: true,
      observe: 'events'
    })
      .pipe(
        catchError(this.sharedService.handleError)
      );
  }

  // Generating a JSON object line with all parameters
  createFileRow(): FileRow {

    let mutuallyExclusive = this.generateBooleanValue(),
      both_no = this.generateBooleanValue(),
      pic = this.generateFakeIdCards(),
      bd = this.generatefakeBirthDates(),
      dii = this.generateValueBetweenRange(2, 60),
      nd = this.generateBooleanValue(),
      ia = this.generateBooleanValue(),
      doa = this.generateFakeAdmissionDate(bd, dii),
      mv = mutuallyExclusive ? (both_no ? 0 : this.generateMultiplicationBooleanValue(5)) : 0,
      svs = mutuallyExclusive ? 0 : (both_no ? 0 : this.generateMultiplicationBooleanValue(2)),
      caa = this.generateBooleanValue(),
      tlf = this.generateBooleanValue(),
      sm = this.generateMultiplicationBooleanValue(5),
      li = this.generateBooleanValue(),
      sMed = mutuallyExclusive ? (both_no ? 0 : this.generateMultiplicationBooleanValue(2)) : 0,
      mMed = mutuallyExclusive ? 0 : (both_no ? 0 : this.generateMultiplicationBooleanValue(3)),
      fdc = this.generateBooleanValue(),
      rdc = fdc ? true : this.generateBooleanValue(), //TODO: bug fix - saved correctly to DB, but not displayed well
      cd = this.generateMultiplicationBooleanValue(3),
      svm = mutuallyExclusive ? (both_no ? 0 : this.generateMultiplicationBooleanValue(3)) : 0,
      mvm = mutuallyExclusive ? 0 : (both_no ? 0 : this.generateMultiplicationBooleanValue(4)),
      ir = this.generateMultiplicationBooleanValue(4),
      pac = this.generateMultiplicationBooleanValue(5),
      lam = this.generateMultiplicationBooleanValue(8),
      cvl = this.generateMultiplicationBooleanValue(2),
      cr = this.generateMultiplicationBooleanValue(3),
      hem = this.generateMultiplicationBooleanValue(3),
      qum = this.generateMultiplicationBooleanValue(2),
      ad = this.generateMultiplicationBooleanValue(3),
      mip = this.generateMultiplicationBooleanValue(4),
      aa = this.generateMultiplicationBooleanValue(4),
      ih = this.generateMultiplicationBooleanValue(3),
      ef = this.generateMultiplicationBooleanValue(2),
      sii = mutuallyExclusive ? (both_no ? 0 : this.generateMultiplicationBooleanValue(3)) : 0,
      mii = mutuallyExclusive ? 0 : (both_no ? 0 : this.generateMultiplicationBooleanValue(5)),
      ioi = this.generateMultiplicationBooleanValue(5),
      hr = this.generateRandomBoxMuller(30, 200),
      esd = this.generateEnumValue(EndStageDiseaseEnum),
      map = this.generateValueBetweenRange(40, 190),
      t = +this.generateValueBetweenRangeIncrements(29, 42, 0.1),
      pao2 = mutuallyExclusive ? +this.generateValueBetweenRange(50, 85) : null,
      aao2 = mutuallyExclusive ? null : +this.generateValueBetweenRange(190, 510),
      rr = this.generateValueBetweenRange(1, 55),
      ss = this.generateValueBetweenRange(100, 150),
      aph = mutuallyExclusive ? +this.generateValueBetweenRangeIncrements(7, 8, 0.01) : null,
      hco3 = mutuallyExclusive ? null : +this.generateValueBetweenRangeIncrements(10, 55, 0.1),
      sc = +this.generateValueBetweenRangeIncrements(0.5, 4, 0.1),
      sp = +this.generateValueBetweenRangeIncrements(2, 8, 0.1),
      glasgow = this.generateValueBetweenRange(3, 15),
      wbc = +this.generateValueBetweenRangeIncrements(0, 45, 0.1),
      ht = +this.generateValueBetweenRangeIncrements(15, 65, 0.1),
      coi = this.generateEnumValue(ChronicOrganInsufficiencyEnum); //TODO: bug fix - saved correctly to DB, but not displayed well

    let fr = new FileRow(pic, bd, dii, nd, ia, doa,
      mv, svs, caa, tlf, sm, li, sMed, mMed,
      rdc, fdc, cd, svm, mvm, ir, pac, lam, cvl, cr,
      hem, qum, ad, mip, aa, ih, ef, sii, mii, ioi,
      hr, esd, map, t, pao2, aao2, rr, ss, aph, hco3,
      sc, sp, glasgow, wbc, ht, coi);

    return fr;
  }

  downloadFile() {
    return this.http.get('https://life-saver-backend.firebaseio.com/fileRows.json').pipe(
      catchError(this.sharedService.handleError)
    ).subscribe(data => {
      var json = JSON.stringify(data);
      var element = document.createElement('a');
      element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(json));
      element.setAttribute('download', "fileRows.json");
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click(); // simulate click
      document.body.removeChild(element);
    });
  }

  generateFakeIdCards(): string {
    let res = '';

    while (res === '') {

      for (let i = 0; i < 9; i++) {
        res += Math.floor(Math.random() * 10).toString();
      }

      res = this.checkLuhn(res) ? res : '';
    }

    return res;
  }

  generatefakeBirthDates(): Date {

    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const min_date = new Date(new Date().setFullYear(new Date().getFullYear() - 17));
    const max_date = new Date(new Date().setFullYear(new Date().getFullYear() - 120));

    const older = Math.round(Math.abs((new Date().getTime() - min_date.getTime()) / oneDay));
    const newer = Math.round(Math.abs((new Date().getTime() - max_date.getTime()) / oneDay));

    let birth_date = new Date(new Date().setDate(new Date().getDate() - this.generateValueBetweenRange(older, newer)));
    return birth_date;

  }

  /* Generate a date between ages 17 and 120 of the patient,
  as long as it's in the past and the number of days in the ICU end in the past, too */
  generateFakeAdmissionDate(birthDate: Date, daysInICU: number) {
    let today = new Date(),
      age17Date = new Date(birthDate.getFullYear() + 17, birthDate.getMonth(), birthDate.getDate()),
      age120Date = new Date(birthDate.getFullYear() + 120, birthDate.getMonth(), birthDate.getDate()),
      subtractDaysInICU = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysInICU),
      max = new Date(Math.min.apply(null, [age120Date, subtractDaysInICU]));

    let admission_date = new Date(this.generateValueBetweenRange(age17Date.getTime(), max.getTime()));
    return admission_date;
  }

  generateValueBetweenRange(min: number, max: number) {
    return this.generateRandomBoxMuller(min, max);
  }

  generateBooleanValue() {
    return this.generateValueBetweenRange(0, 1);
  }

  generateMultiplicationBooleanValue(factor: number) {
    return this.generateBooleanValue() * factor;
  }

  generateEnumValue(typeEnum: any) {
    let enum_length = Object.keys(typeEnum).length / 2;
    let number = this.generateValueBetweenRange(0, enum_length);
    return typeEnum[number - 1];
  }

  generateValueBetweenRangeIncrements(min: number, max: number, increment: number) {
    return this.generateRandomBoxMuller(min, max, increment);
  }

  // Validate Patient ID Card
  checkLuhn(idCard: string) {

    if (isNaN(+idCard) || (idCard.length > 9 || idCard.length < 8)) {
      return false;
    }

    if (idCard.length === 8) {
      idCard = '0' + idCard;
    }

    var len = idCard.length
    var parity = len % 2
    var sum = 0
    for (var i = len - 1; i >= 0; i--) {
      var d = parseInt(idCard.charAt(i))
      if (i % 2 == parity) { d *= 2 }
      if (d > 9) { d -= 9 }
      sum += d
    }
    return sum % 10 == 0;
  }

  // Gaussian Distribution
  private generateRandomBoxMuller(min: number, max: number, increment?: number) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5;
    if (num > 1 || num < 0) return this.generateRandomBoxMuller(min, max);

    if (increment) {
      let fixed = increment * 10;
      return (num * (max - min + 1) + min).toFixed(1);
    }

    else {
      return Math.floor(num * (max - min + 1) + min);
    }
  }

}
