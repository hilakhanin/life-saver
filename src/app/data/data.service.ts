import { Injectable } from '@angular/core';
import { Patient } from './patient.model';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FileRow } from '../shared/file-generator/file-row.model';
import { PatientService } from './patient-list/patient.service';
import { tap, map, catchError, retry, switchMap } from 'rxjs/operators';
import { PatientIndexTypeResult } from './patientIndexTypeResult.model';
import { general_data, categories, IndexType } from '../settings/index-types/index-type.model';
import { SettingService } from '../settings/settings.service';
import { PatientResult } from './patient-result.model';
import { SharedService } from '../shared/shared.service';

export interface FileRowsApi {
  patients: Patient[],
  patientIndexTypeResults: PatientIndexTypeResult[]
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  index_types: IndexType[] = [];


  constructor(private http: HttpClient, private patientService: PatientService,
    private settingService: SettingService, private sharedService: SharedService) {

    this.settingService.fetchIndexTypes().subscribe(res => {
      this.index_types = res;
    });

  }

  parsePatientsFromFile() {
    return this.http
      .get<FileRow[]>('https://life-saver-backend.firebaseio.com/fileRows.json')
      .pipe(
        map((fileRows: FileRow[]) => {
          return this.mapPatientsFromFile(fileRows);
        }),
        tap((fileRows: any) => {
          this.tapPatientsFromFile(fileRows);
        }),
        catchError(this.sharedService.handleError)
      );
  }

  storePatients() {
    const patients = this.patientService.getAllPatients();

    this.http
      .put('https://life-saver-backend.firebaseio.com/patients.json',
        patients
      )
      .pipe(
        tap(() => {
          this.fetchAllPatients()
            .subscribe();
        }),
        catchError(this.sharedService.handleError)
      )
      .subscribe();
  }

  storeAllPatientsIndexTypeResults(patientResults: PatientIndexTypeResult[]) {

    this.http.get('https://life-saver-backend.firebaseio.com/patientIndexTypeResults.json')
      .pipe(
        switchMap((data: PatientIndexTypeResult[]) => {
          let combined_results = [...data || [], ...patientResults || []];

          return this.http
            .put('https://life-saver-backend.firebaseio.com/patientIndexTypeResults.json',
              combined_results)
        }),
        catchError(this.sharedService.handleError)
      )
      .subscribe();
  }

  fetchAllPatients() {
    return this.http.get<Patient[]>('https://life-saver-backend.firebaseio.com/patients.json')
      .pipe(
        tap(res => {
          this.patientService.setAllPatients(res);
        })
      );
  }

  updatePatient(id: string, patient: Patient) {
    this.http.patch(`https://life-saver-backend.firebaseio.com/patients/${this.patientService.getPatientIndex(id)}.json`, {
      idCard: patient.idCard,
      isAlive: patient.isAlive,
      dateOfAdmission: patient.dateOfAdmission,
      dateOfBirth: patient.dateOfBirth,
      isNeedsDialysis: patient.isNeedsDialysis,
      daysInICU: patient.daysInICU,
      tiss28: patient.tiss28,
      apache2: patient.apache2
    })
      .pipe(
        tap(() => {
          this.fetchAllPatients()
            .subscribe();
        }),
        catchError(this.sharedService.handleError)
      )
      .subscribe();
  }

  fetchPatientResults(idCard?: string, category?: number) {
    //Mimicking an SQL WHERE query in the server, as FireBase doesn't support this
    return this.http.get<PatientIndexTypeResult[]>('https://life-saver-backend.firebaseio.com/patientIndexTypeResults.json')
      .pipe(
        map(res => {

          let formattedResults: PatientResult[] = [];

          if (idCard !== undefined && category !== undefined) {
            let indexTypes = this.index_types
              .filter(it => { return it.CategoryId === category })
              .map(f => {
                return f.ID
              });

            let filteredResults = res !== null ? res
              .filter((r, index) => {
                if (r !== null) {
                  r.position = index;
                  return r.patientIdCard === idCard && indexTypes.includes(r.indexTypeId);
                }
              }) : null;

            formattedResults = filteredResults !== null ? filteredResults.map(fr => {
              let index_type = this.index_types.find(type => type.ID === fr.indexTypeId);
              return new PatientResult(fr.patientIdCard, index_type.Name, fr.date, fr.result, false,
                index_type.MinValue, index_type.MaxValue, index_type.IsBoolean, index_type.Increment,
                fr.indexTypeId, fr.position);
            }) : formattedResults;
          }
          else if (idCard === undefined && category !== undefined) {
            return formattedResults;
          }
          else if (idCard !== undefined && category === undefined) {

            formattedResults = res !== null ? res
              .filter((r, index) => {
                if (r !== null) {
                  r.position = index;
                  return r.patientIdCard === idCard;
                }
              }).map(fr => {
                let index_type = this.index_types.find(type => type.ID === fr.indexTypeId);
                return new PatientResult(fr.patientIdCard, index_type.Name, fr.date, fr.result, false,
                  index_type.MinValue, index_type.MaxValue, index_type.IsBoolean, index_type.Increment,
                  fr.indexTypeId, fr.position);
              }) : formattedResults;
          }
          else {
            formattedResults = res != null ? res.map((r, index) => {
              if (r !== null) {
                let index_type = this.index_types.find(type => type.ID === r.indexTypeId);
                return new PatientResult(r.patientIdCard, index_type.Name, r.date, r.result, false,
                  index_type.MinValue, index_type.MaxValue, index_type.IsBoolean, index_type.Increment,
                  r.indexTypeId, index);
              }
            }) : formattedResults;
          }

          return formattedResults;
        }),
        catchError(this.sharedService.handleError)
      );
  }

  savePatientIndexTypeResult(idCard: string, patientResult: PatientResult, length?: number): Observable<any> {

    let formattedResult = new PatientIndexTypeResult(idCard, patientResult.IndexTypeId, patientResult.Date,
      patientResult.Result, patientResult.Position);

    if (patientResult.Position !== undefined) {
      return this.http.patch(`https://life-saver-backend.firebaseio.com/patientIndexTypeResults/${formattedResult.position}.json`, {
        date: formattedResult.date,
        indexTypeId: formattedResult.indexTypeId,
        patientIdCard: formattedResult.patientIdCard,
        result: formattedResult.result
      }).pipe(
        catchError(this.sharedService.handleError)
      );
    }
    else {
      return this.http.put(`https://life-saver-backend.firebaseio.com/patientIndexTypeResults/${length}.json`, {
        date: formattedResult.date,
        indexTypeId: formattedResult.indexTypeId,
        patientIdCard: formattedResult.patientIdCard,
        result: formattedResult.result,
        position: length
      }).pipe(
        map(result => result),
        catchError(this.sharedService.handleError)
      );
    }

  }

  deletePatientIndexTypeResult(resultId: number) {
    return this.http
      .delete<PatientIndexTypeResult>(`https://life-saver-backend.firebaseio.com/patientIndexTypeResults/${resultId}.json`)
      .pipe(
        retry(2),
        catchError(this.sharedService.handleError)
      )
  }

  importPatientsFromFile(patientsJson: string) {

    return this.getImport(patientsJson).pipe(
      map((fileRows: FileRow[]) => {
        return this.mapPatientsFromFile(fileRows);
      }),
      tap((fileRows: any) => {
        this.tapPatientsFromFile(fileRows);
      }),
      catchError(this.sharedService.handleError)
    ).subscribe();
  }


  deleteAllPatientsAndResults() {
    return this.http.delete('https://life-saver-backend.firebaseio.com/fileRows.json').pipe(
      switchMap(() =>
        this.http.delete('https://life-saver-backend.firebaseio.com/patientIndexTypeResults.json')),
      // switchMap(() => this.http.delete('https://life-saver-backend.firebaseio.com/formulas.json')),
      switchMap(() => this.http.delete('https://life-saver-backend.firebaseio.com/patients.json', {
        reportProgress: true,
        observe: 'events'
      })),
      catchError(this.sharedService.handleError),
      tap(() => {
        this.patientService.setAllPatients(<Patient[]>[]);
      })
    );
  }

  //#region Helpers

  private extractPatientIndexTypeResults(fileRow: FileRow) {

    let patient_results: PatientIndexTypeResult[] = [];

    Object.keys(fileRow).forEach(item => {
      if (!general_data.includes(item)) {
        let it = this.index_types.find(i_type => {
          return String(i_type.Name) == String(item) || String(i_type.Marking) == String(item);
        });
        if (it !== undefined) {
          let before_release = new Date(fileRow['DateOfAdmission']);
          before_release.setDate(before_release.getDate() + fileRow['DaysInICU'] - 1);

          let after_admission = new Date(fileRow['DateOfAdmission']);
          after_admission.setDate(after_admission.getDate() + 1);

          let result = new PatientIndexTypeResult(
            fileRow['PatientIdCard'],
            it.ID,
            it.CategoryId == categories[1].Id ?
              after_admission :
              (it.CategoryId == categories[2].Id ?
                before_release :
                new Date(fileRow['DateOfAdmission'])), //TODO: take this into consideration with the Missing Data
            fileRow[item]
          );

          patient_results.push(result);
        }
      }
    });

    return patient_results;
  }

  private mapPatientsFromFile(fileRows: FileRow[]): FileRowsApi {
    return <FileRowsApi>{
      patients: fileRows.map((fr: FileRow) => {
        return new Patient(fr['PatientIdCard'],
          fr['IsAlive'],
          fr['BirthDate'],
          fr['DateOfAdmission'],
          fr['IsNeedsDialysis'],
          fr['DaysInICU'],
          fr['_tISS28Score'],
          fr['_apache2Score']
        );
      }),
      patientIndexTypeResults: [].concat(...fileRows.map(fr => {
        return this.extractPatientIndexTypeResults(fr);
      }))
    }
  }

  private tapPatientsFromFile(fileRows: FileRowsApi) {
    let existing_patients = new Set(this.patientService.getAllPatients() !== null ? this.patientService.getAllPatients().map(d => d.idCard) : null);
    let combined_patients = [...this.patientService.getAllPatients() || [], ...fileRows.patients.filter(d => !existing_patients.has(d.idCard)) || []];

    this.patientService.setAllPatients(combined_patients);
    this.storePatients();
    this.storeAllPatientsIndexTypeResults(fileRows.patientIndexTypeResults);
  }

  private getImport(patientsJson: any): Observable<FileRow[]> {
    return of(<FileRow[]>patientsJson);
  }

  //#endregion
}
