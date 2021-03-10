import { Injectable } from '@angular/core';
import { PatientResult } from '../data/patient-result.model';
import { Patient } from '../data/patient.model';
import { ChronicOrganInsufficiencyEnum } from './file-generator/chronic-organ-insufficiency.enum';
import { EndStageDiseaseEnum } from './file-generator/end-stage-disease.enum';
import { FileRow } from './file-generator/file-row.model';
import { HelperService } from './helper.service';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  constructor(private helperService: HelperService, private sharedService: SharedService) { }

  //Score Calculations
  calculateTISS28Score(fileRow: FileRow) {
    let tiss28 = fileRow.MechanicalVentilation + fileRow.SupplementaryVentilatorySupport +
      (fileRow.CareOfArtificialAirways ? 1 : 0) + (fileRow.TreatmentLungFunction ? 1 : 0) + fileRow.StandardMonitoring +
      (fileRow.LaboratoryInvestigations ? 1 : 0) + fileRow.SingleMedication + fileRow.MultipleIntravenousMedications +
      (fileRow.RoutineDressingChanges ? 1 : 0) + (fileRow.FrequentDressingChanges ? 1 : 0) + fileRow.CareOfDrains + fileRow.SingleVasoactiveMedication +
      fileRow.MultipleVasoactiveMedications + fileRow.IntravenousReplacementOfLargeFluidLosses + fileRow.PeripheralArterialCatheter +
      fileRow.LeftAtriumMonitoring + fileRow.CentralVenousLine + fileRow.CardiopulmonaryResuscitation + fileRow.Hemofiltration +
      fileRow.QuantitativeUrineOutputMeasurement + fileRow.ActiveDiuresis + fileRow.MeasurementOfIntracranialPressure +
      fileRow.AcidosisAlkalosis + fileRow.IntravenousHyperalimentation + fileRow.EnteralFeeding + fileRow.SingleInterventionsInICU +
      fileRow.MultipleInterventionsInICU + fileRow.InterventionsOutsideOfICU;

    return tiss28;
  }

  calculateApache2Score(fileRow: FileRow) {
    let apache2 = this.calculateHeartRateScore(fileRow.HeartRate) +
      this.calculateMeanArterialPressureScore(fileRow.MeanArterialPressure) +
      this.calculateTemperatureScore(fileRow.Temperature) +
      this.calculateO2Score(fileRow.PaO2, fileRow.AaO2) +
      this.calculateRespiratoryRateScore(fileRow.RespiratoryRate) +
      this.calculateSerumSodiumScore(fileRow.SerumSodium) +
      this.calculateBloodPHScore(fileRow.ArterialPH, fileRow.SerumHCO3) +
      this.calculateSerumCreatinineScore(fileRow.EndStageDisease, fileRow.SerumCreatinine) +
      this.calculateSerumPotassiumScore(fileRow.SerumPotassium) +
      (15 - fileRow.Glasgow) +
      this.calculateWBCScore(fileRow.WBC) +
      this.calculateHematocritScore(fileRow.Ht) +
      this.calculateChronicOrganInsufficiencyScore(fileRow.ChronicOrganInsufficiency) +
      this.calculateAgeScore(fileRow.BirthDate);

    return apache2;
  }

  prepareForScoreCalculation(patient?: Patient, array?: PatientResult[], obj?: Object) {
    let copy: FileRow;
    if (array === null && obj === null) {
      console.log('Nothing to prepare');
      return;
    }

    if (array !== null && array instanceof Array) { // coming from detectMissingIndexTypeResults

      const pao2 = array.find(r => r.IndexTypeName === 'PaO2'),
        aao2 = array.find(r => r.IndexTypeName === 'AaO2'),
        arterialPH = array.find(r => r.IndexTypeName === 'Arterial PH'),
        serumHCO3 = array.find(r => r.IndexTypeName === 'Serum HCO3-');

      copy = new FileRow(patient.idCard,
        new Date(patient.dateOfBirth),
        patient.daysInICU,
        patient.isNeedsDialysis,
        patient.isAlive,
        new Date(patient.dateOfAdmission),
        array.find(r => r.IndexTypeName === 'Mechanical Ventilation').Result,
        array.find(r => r.IndexTypeName === 'Supplementary Ventilatory Support').Result,
        !!array.find(r => r.IndexTypeName === 'Care of Artificial Airways').Result,
        !!array.find(r => r.IndexTypeName === 'Treatment for Improving Lung Function').Result,
        array.find(r => r.IndexTypeName === 'Standard Monitoring').Result,
        !!array.find(r => r.IndexTypeName === 'Laboratory Investigations').Result,
        array.find(r => r.IndexTypeName === 'Single Medication').Result,
        array.find(r => r.IndexTypeName === 'Multiple Intravenous Medications').Result,
        !!array.find(r => r.IndexTypeName === 'Routine Dressing Changes').Result,
        !!array.find(r => r.IndexTypeName === 'Frequent Dressing Changes').Result,
        array.find(r => r.IndexTypeName === 'Care of Drains').Result,
        array.find(r => r.IndexTypeName === 'Single Vasoactive Medication').Result,
        array.find(r => r.IndexTypeName === 'Multiple Vasoactive Medications').Result,
        array.find(r => r.IndexTypeName === 'Intravenous Replacement of Large Fluid Losses').Result,
        array.find(r => r.IndexTypeName === 'Peripheral Arterial Catheter').Result,
        array.find(r => r.IndexTypeName === 'Left Atrium Monitoring').Result,
        array.find(r => r.IndexTypeName === 'Central Venous Line').Result,
        array.find(r => r.IndexTypeName === 'Cardiopulmonary Resuscitation').Result,
        array.find(r => r.IndexTypeName === 'Hemofiltration').Result,
        array.find(r => r.IndexTypeName === 'Quantitative Urine Output Measurement').Result,
        array.find(r => r.IndexTypeName === 'Active Diuresis').Result,
        array.find(r => r.IndexTypeName === 'Measurement of Intracranial Pressure').Result,
        array.find(r => r.IndexTypeName === 'Treatment of Acidosis or Alkalosis').Result,
        array.find(r => r.IndexTypeName === 'Intravenous Hyperalimentation').Result,
        array.find(r => r.IndexTypeName === 'Enteral Feeding').Result,
        array.find(r => r.IndexTypeName === 'Single Interventions in ICU').Result,
        array.find(r => r.IndexTypeName === 'Multiple Interventions in ICU').Result,
        array.find(r => r.IndexTypeName === 'Interventions Outside of ICU').Result,
        array.find(r => r.IndexTypeName === 'Heart Rate').Result,
        EndStageDiseaseEnum[array.find(r => r.IndexTypeName === 'End Stage Disease').Result],
        array.find(r => r.IndexTypeName === 'Mean Arterial Pressure').Result,
        array.find(r => r.IndexTypeName === 'Temperature').Result,
        pao2 ? pao2.Result : null,
        aao2 ? aao2.Result : null,
        array.find(r => r.IndexTypeName === 'Respiratory Rate').Result,
        array.find(r => r.IndexTypeName === 'Serum Sodium').Result,
        arterialPH ? arterialPH.Result : null,
        serumHCO3 ? serumHCO3.Result : null,
        array.find(r => r.IndexTypeName === 'Serum Creatinine').Result,
        array.find(r => r.IndexTypeName === 'Serum Potassium').Result,
        array.find(r => r.IndexTypeName === 'Glasgow Coma Score').Result,
        array.find(r => r.IndexTypeName === 'WBC').Result,
        array.find(r => r.IndexTypeName === 'Ht').Result,
        ChronicOrganInsufficiencyEnum[array.find(r => r.IndexTypeName === 'Chronic Organ Insufficiency').Result]
      );

    }
    else if (obj !== null) { // coming from importNewPatients

      copy = new FileRow(obj['PatientIdCard'],
        new Date(obj['BirthDate']),
        obj['DaysInICU'],
        obj['IsNeedsDialysis'],
        obj['IsAlive'],
        new Date(obj['DateOfAdmission']),
        obj['MechanicalVentilation'],
        obj['SupplementaryVentilatorySupport'],
        obj['CareOfArtificialAirways'],
        obj['TreatmentLungFunction'],
        obj['StandardMonitoring'],
        obj['LaboratoryInvestigations'],
        obj['SingleMedication'],
        obj['MultipleIntravenousMedications'],
        obj['RoutineDressingChanges'],
        obj['FrequentDressingChanges'],
        obj['CareOfDrains'],
        obj['SingleVasoactiveMedication'],
        obj['MultipleVasoactiveMedications'],
        obj['IntravenousReplacementOfLargeFluidLosses'],
        obj['PeripheralArterialCatheter'],
        obj['LeftAtriumMonitoring'],
        obj['CentralVenousLine'],
        obj['CardiopulmonaryResuscitation'],
        obj['Hemofiltration'],
        obj['QuantitativeUrineOutputMeasurement'],
        obj['ActiveDiuresis'],
        obj['MeasurementOfIntracranialPressure'],
        obj['AcidosisAlkalosis'],
        obj['IntravenousHyperalimentation'],
        obj['EnteralFeeding'],
        obj['SingleInterventionsInICU'],
        obj['MultipleInterventionsInICU'],
        obj['InterventionsOutsideOfICU'],
        obj['HeartRate'],
        obj['EndStageDisease'],
        obj['MeanArterialPressure'],
        obj['Temperature'],
        obj['PaO2'],
        obj['AaO2'],
        obj['RespiratoryRate'],
        obj['SerumSodium'],
        obj['ArterialPH'],
        obj['SerumHCO3'],
        obj['SerumCreatinine'],
        obj['SerumPotassium'],
        obj['Glasgow'],
        obj['WBC'],
        obj['Ht'],
        obj['ChronicOrganInsufficiency']
      );

    }

    copy._tISS28Score = this.calculateTISS28Score(copy);
    copy._apache2Score = this.calculateApache2Score(copy);
    return copy;
  }

  //Apache II Calculations
  private calculateHeartRateScore(heartRate: number) {
    switch (true) {
      case (heartRate <= 39 || heartRate >= 180):
        return 4;
      case ((heartRate >= 40 && heartRate <= 54) || (heartRate >= 140 && heartRate <= 179)):
        return 3;
      case ((heartRate >= 55 && heartRate <= 69) || (heartRate >= 110 && heartRate <= 139)):
        return 2;
      case (heartRate >= 70 && heartRate <= 109):
        return 0;
    }
  }

  private calculateMeanArterialPressureScore(meanArterialPressure: number) {
    switch (true) {
      case (meanArterialPressure <= 49 || meanArterialPressure >= 160):
        return 4;
      case ((meanArterialPressure >= 50 && meanArterialPressure <= 69) || (meanArterialPressure >= 110 && meanArterialPressure <= 129)):
        return 2;
      case (meanArterialPressure >= 130 && meanArterialPressure <= 159):
        return 3;
      case (meanArterialPressure >= 70 && meanArterialPressure <= 109):
        return 0;
    }
  }

  private calculateTemperatureScore(temperature: number) {
    switch (true) {
      case (temperature <= 29.9 || temperature >= 41):
        return 4;
      case ((temperature >= 30 && temperature <= 31.9) || (temperature >= 39 && temperature <= 40.9)):
        return 3;
      case (temperature >= 32 && temperature <= 33.9):
        return 2;
      case ((temperature >= 34 && temperature <= 35.9) || (temperature >= 38.5 && temperature <= 38.9)):
        return 1;
      case (temperature >= 36 && temperature <= 38.4):
        return 1;
    }
  }

  private calculateO2Score(pao2?: number, aao2?: number) {
    if (pao2 !== null && pao2 !== undefined) {
      switch (true) {
        case (pao2 < 55):
          return 4;
        case (pao2 >= 55 && pao2 <= 60):
          return 3;
        case (pao2 >= 61 && pao2 <= 70):
          return 1;
        case (pao2 > 70):
          return 0;
      }
    }
    else if (aao2 !== null && aao2 !== undefined) {
      switch (true) {
        case (aao2 < 200):
          return 0;
        case (aao2 >= 200 && aao2 <= 349):
          return 2;
        case (aao2 >= 350 && aao2 <= 499):
          return 3;
        case (aao2 >= 500):
          return 4;
      }
    }
  }

  private calculateRespiratoryRateScore(respiratoryRate: number) {
    switch (true) {
      case (respiratoryRate <= 5 || respiratoryRate >= 50):
        return 4;
      case (respiratoryRate >= 6 && respiratoryRate <= 9):
        return 2;
      case ((respiratoryRate >= 10 && respiratoryRate <= 11) || (respiratoryRate >= 25 && respiratoryRate <= 34)):
        return 1;
      case (respiratoryRate >= 12 && respiratoryRate <= 24):
        return 0;
      case (respiratoryRate >= 35 && respiratoryRate <= 49):
        return 3;
    }
  }

  private calculateSerumSodiumScore(serumSodium: number) {
    switch (true) {
      case (serumSodium <= 110 || serumSodium >= 180):
        return 4;
      case ((serumSodium >= 160 && serumSodium <= 179) || (serumSodium >= 111 && serumSodium <= 119)):
        return 3;
      case ((serumSodium >= 155 && serumSodium <= 159) || (serumSodium >= 120 && serumSodium <= 129)):
        return 2;
      case (serumSodium >= 150 && serumSodium <= 154):
        return 1;
      case (serumSodium >= 130 && serumSodium <= 149):
        return 0;
    }
  }

  private calculateBloodPHScore(arterialPH?: number, serumHCO3?: number) {
    if (arterialPH !== null && arterialPH !== undefined) {
      switch (true) {
        case (arterialPH >= 7.7 || arterialPH < 7.15):
          return 4;
        case ((arterialPH >= 7.6 && arterialPH <= 7.69) || (arterialPH >= 7.15 && arterialPH <= 7.24)):
          return 3;
        case (arterialPH >= 7.5 && arterialPH <= 7.59):
          return 1;
        case (arterialPH >= 7.33 && arterialPH <= 7.49):
          return 0;
        case (arterialPH >= 7.25 && arterialPH <= 7.32):
          return 2;
      }
    }
    else if (serumHCO3 !== null && serumHCO3 !== undefined) {
      switch (true) {
        case (serumHCO3 >= 52 || serumHCO3 < 15):
          return 4;
        case ((serumHCO3 >= 41 && serumHCO3 <= 51.9) || (serumHCO3 >= 15 && serumHCO3 <= 17.9)):
          return 3;
        case (serumHCO3 >= 32 && serumHCO3 <= 40.9):
          return 1;
        case (serumHCO3 >= 22 && serumHCO3 <= 31.9):
          return 0;
        case (serumHCO3 >= 18 && serumHCO3 <= 21.9):
          return 2;
      }
    }
  }

  private calculateSerumCreatinineScore(endStageDisease: string, serumCreatinine: number) {

    if (endStageDisease === EndStageDiseaseEnum[5]) {
      switch (true) {
        case (serumCreatinine < 0.6 || (serumCreatinine >= 1.5 && serumCreatinine <= 1.9)):
          return 2;
        case (serumCreatinine >= 0.6 && serumCreatinine <= 1.4):
          return 0;
        case (serumCreatinine >= 2 && serumCreatinine <= 3.4):
          return 3;
        case (serumCreatinine >= 3.5):
          return 4;
      }
    }
    else {
      switch (true) {
        case (serumCreatinine < 0.6 || (serumCreatinine >= 1.5 && serumCreatinine <= 1.9)):
          return 4;
        case (serumCreatinine >= 0.6 && serumCreatinine <= 1.4):
          return 0;
        case (serumCreatinine >= 2 && serumCreatinine <= 3.4):
          return 6;
        case (serumCreatinine >= 3.5):
          return 8;
      }
    }
  }

  private calculateSerumPotassiumScore(serumPotassium: number) {
    switch (true) {
      case (serumPotassium >= 7 || serumPotassium < 2.5):
        return 4;
      case (serumPotassium >= 6 && serumPotassium <= 6.9):
        return 3;
      case ((serumPotassium >= 5.5 && serumPotassium <= 5.9) || (serumPotassium >= 3 && serumPotassium <= 3.4)):
        return 1;
      case (serumPotassium >= 3.5 && serumPotassium <= 5.4):
        return 0;
      case (serumPotassium >= 2.5 && serumPotassium <= 2.9):
        return 2;
    }
  }

  private calculateWBCScore(wbc: number) {
    switch (true) {
      case (wbc < 1 || wbc >= 40):
        return 4;
      case ((wbc >= 1 && wbc <= 2.9) || (wbc >= 20 && wbc <= 39.9)):
        return 2;
      case (wbc >= 3 && wbc <= 14.9):
        return 0;
      case (wbc >= 15 && wbc <= 19.9):
        return 1;
    }
  }

  private calculateHematocritScore(ht: number) {
    switch (true) {
      case (ht < 20 || ht > 60):
        return 4;
      case ((ht >= 20 && ht <= 29.9) || (ht >= 50 && ht <= 59.9)):
        return 2;
      case (ht >= 30 && ht <= 45.9):
        return 0;
      case (ht >= 46 && ht <= 49.9):
        return 1;

    }
  }

  private calculateChronicOrganInsufficiencyScore(chronicOrganInsufficiency: string) {
    return this.sharedService.chronicOrganInsufficiency(chronicOrganInsufficiency);
  }

  private calculateAgeScore(birthDate: Date) {
    const age = this.helperService.calculateAge(birthDate);

    switch (true) {
      case (age <= 44):
        return 0;
      case (age >= 45 && age <= 54):
        return 2;
      case (age >= 55 && age <= 64):
        return 3;
      case (age >= 65 && age <= 74):
        return 5;
      case (age >= 75):
        return 6;
    }
  }
}
