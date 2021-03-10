import { Injectable } from '@angular/core';
import { IndexType } from './index-types/index-type.model';
import { MeasurementUnitEnum } from './index-types/measurement-unit.enum';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { IndexTypeService } from './index-types/index-type.service';
import { dates } from '../shared/shared.service';
import { RuleConfig } from './configuration/configuration.component';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  //#region Setup

  indexTypeList: IndexType[] = [
    //TISS28
    { ID: 1, Name: 'Mechanical Ventilation', MinValue: 0, MaxValue: 5, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'MechanicalVentilation' },
    { ID: 2, Name: 'Supplementary Ventilatory Support', MinValue: 0, MaxValue: 2, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'SupplementaryVentilatorySupport' },
    { ID: 3, Name: 'Care Of Artificial Airways', MinValue: 0, MaxValue: 1, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'CareOfArtificialAirways' },
    { ID: 4, Name: 'Treatment For Improving Lung Function', MinValue: 0, MaxValue: 1, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'TreatmentLungFunction' },
    { ID: 5, Name: 'Standard Monitoring', MinValue: 0, MaxValue: 5, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'StandardMonitoring' },
    { ID: 6, Name: 'Laboratory Investigations', MinValue: 0, MaxValue: 1, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'LaboratoryInvestigations' },
    { ID: 7, Name: 'Single Medication', MinValue: 0, MaxValue: 2, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'SingleMedication' },
    { ID: 8, Name: 'Multiple Intravenous Medications', MinValue: 0, MaxValue: 3, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'MultipleIntravenousMedications' },
    { ID: 9, Name: 'Routine Dressing Changes', MinValue: 0, MaxValue: 1, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'RoutineDressingChanges' },
    { ID: 10, Name: 'Frequent Dressing Changes', MinValue: 0, MaxValue: 1, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'FrequentDressingChanges' },
    { ID: 11, Name: 'Care Of Drains', MinValue: 0, MaxValue: 3, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'CareOfDrains' },
    { ID: 12, Name: 'Single Vasoactive Medication', MinValue: 0, MaxValue: 3, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'SingleVasoactiveMedication' },
    { ID: 13, Name: 'Multiple Vasoactive Medications', MinValue: 0, MaxValue: 4, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'MultipleVasoactiveMedications' },
    { ID: 14, Name: 'Intravenous Replacement Of Large Fluid Losses', MinValue: 0, MaxValue: 4, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'IntravenousReplacementOfLargeFluidLosses' },
    { ID: 15, Name: 'Peripheral Arterial Catheter', MinValue: 0, MaxValue: 5, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'PeripheralArterialCatheter' },
    { ID: 16, Name: 'Left Atrium Monitoring', MinValue: 0, MaxValue: 8, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'LeftAtriumMonitoring' },
    { ID: 17, Name: 'Central Venous Line', MinValue: 0, MaxValue: 2, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'CentralVenousLine' },
    { ID: 18, Name: 'Cardiopulmonary Resuscitation', MinValue: 0, MaxValue: 3, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'CardiopulmonaryResuscitation' },
    { ID: 19, Name: 'Hemofiltration', MinValue: 0, MaxValue: 3, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'Hemofiltration' },
    { ID: 20, Name: 'Quantitative Urine Output Measurement', MinValue: 0, MaxValue: 2, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'QuantitativeUrineOutputMeasurement' },
    { ID: 21, Name: 'Active Diuresis', MinValue: 0, MaxValue: 3, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'ActiveDiuresis' },
    { ID: 22, Name: 'Measurement Of Intracranial Pressure', MinValue: 0, MaxValue: 4, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'MeasurementOfIntracranialPressure' },
    { ID: 23, Name: 'Treatment Of Acidosis or Alkalosis', MinValue: 0, MaxValue: 4, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'AcidosisAlkalosis' },
    { ID: 24, Name: 'Intravenous Hyperalimentation', MinValue: 0, MaxValue: 3, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'IntravenousHyperalimentation' },
    { ID: 25, Name: 'Enteral Feeding', MinValue: 0, MaxValue: 2, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'EnteralFeeding' },
    { ID: 26, Name: 'Single Interventions In ICU', MinValue: 0, MaxValue: 3, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'SingleInterventionsInICU' },
    { ID: 27, Name: 'Multiple Interventions In ICU', MinValue: 0, MaxValue: 5, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'MultipleInterventionsInICU' },
    { ID: 28, Name: 'Interventions Outside Of ICU', MinValue: 0, MaxValue: 5, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 1, Marking: 'InterventionsOutsideOfICU' },

    //Apache2
    { ID: 29, Name: 'Heart Rate', MinValue: 30, MaxValue: 200, UnitOfMeasurement: MeasurementUnitEnum['BPM'], IsBoolean: false, CategoryId: 2, Marking: 'HeartRate' },
    { ID: 30, Name: 'End Stage Disease', MinValue: 0, MaxValue: 9, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: false, CategoryId: 2, Marking: 'EndStageDisease' },
    { ID: 31, Name: 'Mean Arterial Pressure', MinValue: 40, MaxValue: 190, UnitOfMeasurement: MeasurementUnitEnum['mmHg'], IsBoolean: false, CategoryId: 2, Marking: 'MeanArterialPressure' },
    { ID: 32, Name: 'Temperature', MinValue: 29, MaxValue: 42, UnitOfMeasurement: MeasurementUnitEnum['DegreesCelcius'], IsBoolean: false, Increment: 0.1, CategoryId: 2, Marking: 'Temperature' },
    { ID: 33, Name: 'PaO2', MinValue: 50, MaxValue: 85, UnitOfMeasurement: MeasurementUnitEnum['mmHg'], IsBoolean: false, CategoryId: 2, Marking: 'PaO2' },
    { ID: 34, Name: '(A-a) O2', MinValue: 190, MaxValue: 510, UnitOfMeasurement: MeasurementUnitEnum['mmHg'], IsBoolean: false, CategoryId: 2, Marking: 'AaO2' },
    { ID: 35, Name: 'Respiratory Rate', MinValue: 1, MaxValue: 55, UnitOfMeasurement: MeasurementUnitEnum['BPM'], IsBoolean: false, CategoryId: 2, Marking: 'RespiratoryRate' },
    { ID: 36, Name: 'Serum Sodium', MinValue: 100, MaxValue: 150, UnitOfMeasurement: MeasurementUnitEnum['mmolL'], IsBoolean: false, CategoryId: 2, Marking: 'SerumSodium' },
    { ID: 37, Name: 'Arterial PH', MinValue: 7, MaxValue: 8, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: false, Increment: 0.01, CategoryId: 2, Marking: 'ArterialPH' },
    { ID: 38, Name: 'Serum HCO3-', MinValue: 10, MaxValue: 55, UnitOfMeasurement: MeasurementUnitEnum['mmolL'], IsBoolean: false, Increment: 0.1, CategoryId: 2, Marking: 'SerumHCO3' },
    { ID: 39, Name: 'Serum Creatinine', MinValue: 0.5, MaxValue: 4, UnitOfMeasurement: MeasurementUnitEnum['mgdl'], IsBoolean: false, Increment: 0.1, CategoryId: 2, Marking: 'SerumCreatinine' },
    { ID: 40, Name: 'Serum Potassium', MinValue: 2, MaxValue: 8, UnitOfMeasurement: MeasurementUnitEnum['mmolL'], IsBoolean: false, Increment: 0.1, CategoryId: 2, Marking: 'SerumPotassium' },
    { ID: 41, Name: 'Glasgow Coma Score', MinValue: 3, MaxValue: 15, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: false, CategoryId: 2, Marking: 'Glasgow' },
    { ID: 42, Name: 'WBC', MinValue: 0, MaxValue: 45, UnitOfMeasurement: MeasurementUnitEnum['x103mm3'], IsBoolean: false, Increment: 0.1, CategoryId: 2, Marking: 'WBC' },
    { ID: 43, Name: 'Ht', MinValue: 15, MaxValue: 65, UnitOfMeasurement: MeasurementUnitEnum['Percent'], IsBoolean: false, Increment: 0.1, CategoryId: 2, Marking: 'Ht' },
    { ID: 44, Name: 'Chronic Organ Insufficiency', MinValue: 0, MaxValue: 3, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: false, CategoryId: 2, Marking: 'ChronicOrganInsufficiency' },
    { ID: 45, Name: 'Age', MinValue: 17, MaxValue: 120, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: false, CategoryId: 2, Marking: 'Age' },

    //General
    { ID: -1, Name: 'TISS-28', MinValue: 0, MaxValue: 1000, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: false, CategoryId: 1, Marking: 'tiss28' },
    { ID: -2, Name: 'Apache2', MinValue: 0, MaxValue: 1000, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: false, CategoryId: 2, Marking: 'apache2' },
    { ID: -3, Name: 'Birth Date', MinValue: dates.MIN_VALUE, MaxValue: dates.MAX_VALUE, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: false, CategoryId: 0, Marking: 'BirthDate' },
    { ID: -4, Name: 'Days In ICU', MinValue: 2, MaxValue: 60, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: false, CategoryId: 0, Marking: 'DaysInICU' },
    { ID: -5, Name: 'Dialysis', MinValue: 0, MaxValue: 1, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 0, Marking: 'IsNeedsDialysis' },
    { ID: -6, Name: 'Alive', MinValue: 0, MaxValue: 1, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: true, CategoryId: 0, Marking: 'IsAlive' },
    { ID: -7, Name: 'Admission Date', MinValue: dates.MIN_VALUE, MaxValue: dates.MAX_VALUE, UnitOfMeasurement: MeasurementUnitEnum['Units'], IsBoolean: false, CategoryId: 0, Marking: 'DateOfAdmission' }
  ];

  //#endregion Setup

  indexTypesChanged = new Subject<IndexType[]>();

  constructor(private http: HttpClient, private indexTypeService: IndexTypeService) { }

  storeIndexTypes() {
    // const indexTypes = this.indexTypeList;
    const indexTypes = this.indexTypeService.getIndexTypes();
    this.http
      .put('https://life-saver-backend.firebaseio.com/indexTypes.json',
        indexTypes
      )
      .subscribe(response => {
        console.log(response);
      });
  }

  fetchIndexTypes(filter?: boolean): Observable<IndexType[]> {
    return this.http
      .get<IndexType[]>('https://life-saver-backend.firebaseio.com/indexTypes.json')
      .pipe(
        map(indexTypes => {
          if (indexTypes !== null) {
            const no_scores = indexTypes.filter(type => type.ID >= 0);
            return filter ? indexTypes : no_scores;
          }

          return indexTypes;
        }),
        tap(indexTypes => {
          this.indexTypeService.setIndexTypes(indexTypes);
        }));
  }
}
