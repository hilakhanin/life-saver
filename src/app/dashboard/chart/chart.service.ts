import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { Patient } from '../../data/patient.model';
import { PatientIndexTypeResult } from '../../data/patientIndexTypeResult.model';

export interface ChartApi {
  patient: Patient;
  results: PatientIndexTypeResult[];
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor(private http: HttpClient) { }

  //fetch all patients and their results
  patientData() {
    return this.http.get<Patient[]>('https://life-saver-backend.firebaseio.com/patients.json')
      .pipe(
        switchMap(patients => {
          return this.http.get<PatientIndexTypeResult[]>('https://life-saver-backend.firebaseio.com/patientIndexTypeResults.json')
            .pipe(
              map(results => {
                let list: ChartApi[] = [];

                if (patients && results) {
                  patients.forEach(p => {
                    let chart_item = <ChartApi>{
                      patient: p,
                      results: results.filter(r => {
                        if (r != null) {
                          return r.patientIdCard === p.idCard;
                        }
                      })
                    };
                    list.push(chart_item);
                  });
                }

                return list;
              })
            );
        })
      );
  }
}
