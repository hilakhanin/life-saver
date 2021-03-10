import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Patient } from './patient.model';
import { PatientService } from './patient-list/patient.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class PatientResolverService implements Resolve<Patient[]> {

  constructor(
    private patientService: PatientService,
    private dataService: DataService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Patient[]> | Promise<Patient[]> | Patient[] {
    const patients = this.patientService.getAllPatients();

    if (patients === null || patients.length === 0) {
      return this.dataService.fetchAllPatients();
    } else {
      return patients;
    }
  }
}
