import { Injectable } from "@angular/core";
import { Patient } from "../patient.model";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private patients: Patient[] = []; //used for pagination
  private allPatients: Patient[] = [];
  allPatientsChanged = new BehaviorSubject<Patient[]>(null);

  constructor() { }

  addPatient(patient: Patient) {
    this.allPatients = this.allPatients || [];
    this.allPatients.push(patient);
    this.allPatientsChanged.next(this.allPatients.slice());
  }

  setPatients(patients: Patient[]) {
    this.patients = patients;
  }

  getPatient(idCard: string) {
    return this.allPatients !== null ? this.allPatients.find(p => p.idCard === idCard) : undefined;
  }

  setAllPatients(all_patients: Patient[]) {
    this.allPatients = all_patients;
    this.allPatientsChanged.next(this.allPatients !== null ? this.allPatients.slice() : this.allPatients);
  }

  getAllPatients() {
    return this.allPatients !== null ? this.allPatients.slice() : this.allPatients;
  }

  getPatientIndex(idCard: string) {
    return this.allPatients !== null ? this.allPatients.findIndex(i => i.idCard === idCard) : -1;
  }
}