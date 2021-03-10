export class FileRow {

    //General
    PatientIdCard: string;
    BirthDate: Date;
    DaysInICU: number; //[2..60]
    IsNeedsDialysis: boolean;
    IsAlive: boolean;
    DateOfAdmission: Date;

    //TISS Related
    MechanicalVentilation: number; //0/5
    SupplementaryVentilatorySupport: number; //0/2
    CareOfArtificialAirways: boolean;
    TreatmentLungFunction: boolean;
    StandardMonitoring: number; //0/5
    LaboratoryInvestigations: boolean;
    SingleMedication: number; //0/2
    MultipleIntravenousMedications: number; //0/3, if true, requires single to also be true
    RoutineDressingChanges: boolean;
    FrequentDressingChanges: boolean; // if true, requires routine to also be true
    CareOfDrains: number; //0/3
    SingleVasoactiveMedication: number; //0/3
    MultipleVasoactiveMedications: number;  //0/4, if true, requires single to also be true
    IntravenousReplacementOfLargeFluidLosses: number; //0/4
    PeripheralArterialCatheter: number; //0/5
    LeftAtriumMonitoring: number; //0/8
    CentralVenousLine: number; //0/2
    CardiopulmonaryResuscitation: number; //0/3
    Hemofiltration: number; //0/3
    QuantitativeUrineOutputMeasurement: number; //0/2
    ActiveDiuresis: number; //0/3
    MeasurementOfIntracranialPressure: number; //0/4
    AcidosisAlkalosis: number; //0/4
    IntravenousHyperalimentation: number; //0/3
    EnteralFeeding: number; //0/2
    SingleInterventionsInICU: number; //0/3
    MultipleInterventionsInICU: number; //0/5, if true, requires single to also be true
    InterventionsOutsideOfICU: number; //0/5
    public _tISS28Score: number;

    //ApacheRelated
    HeartRate: number; //[30..200]
    EndStageDisease: string; //Enum
    MeanArterialPressure: number; //[40..190]
    Temperature: number; //[29..42], increments of 0.1
    PaO2?: number; //[50..85] - mutually exclusive to AaO2
    AaO2?: number; //[190..510] - mutually exclusive to PaO2
    RespiratoryRate: number; //[1..55]
    SerumSodium: number; //[100..150]
    ArterialPH?: number; //[7..8] - mutually exclusive to SerumHCO3, increments of 0.01
    SerumHCO3?: number; //[10..55] - mutually exclusive to ArterialPH, increments of 0.1
    SerumCreatinine: number; //[0.5..4], increments of 0.1. Mind the presence or absence of EndStageDisease = Acute Renal Failure, as there are two separate grading systems for these.
    SerumPotassium: number; //[2..8], increments of 0.1
    Glasgow: number; //[3..15]
    WBC: number; //[0..45], increments of 0.1
    Ht: number; //[15..65], increments of 0.1
    ChronicOrganInsufficiency: string; //Enum, 0/2/5
    public _apache2Score: number;

    constructor(patientIdCard: string, birthDate: Date, daysInICU: number, isNeedsDialysis: boolean, isAlive: boolean, dateOfAdmission: Date,
        mechanicalVentilation: number, supplementaryVentilatorySupport: number,
        careOfArtificialAirways: boolean, treatmentLungFunction: boolean, standardMonitoring: number, laboratoryInvestigations: boolean,
        singleMedication: number, multipleIntravenousMedications: number, routineDressingChanges: boolean, frequentDressingChanges: boolean,
        careOfDrains: number, singleVasoactiveMedication: number, multipleVasoactiveMedications: number,
        intravenousReplacementOfLargeFluidLosses: number, peripheralArterialCatheter: number, leftAtriumMonitoring: number,
        centralVenousLine: number, cardiopulmonaryResuscitation: number, hemofiltration: number,
        quantitativeUrineOutputMeasurement: number, activeDiuresis: number, measurementOfIntracranialPressure: number,
        acidosisAlkalosis: number, intravenousHyperalimentation: number, enteralFeeding: number, singleInterventionsInICU: number,
        multipleInterventionsInICU: number, interventionsOutsideOfICU: number, heartRate: number, endStageDisease: string,
        meanArterialPressure: number, temperature: number, paO2: number, aaO2: number, respiratoryRate: number, serumSodium: number,
        arterialPH: number, serumHCO3: number, serumCreatinine: number, serumPotassium: number, glasgow: number, wbc: number, ht: number,
        chronicOrganInsufficiency: string) {

        this.PatientIdCard = patientIdCard;
        this.BirthDate = birthDate;
        this.DaysInICU = daysInICU;
        this.IsNeedsDialysis = isNeedsDialysis;
        this.IsAlive = isAlive;
        this.DateOfAdmission = dateOfAdmission;

        //TISS Related
        this.MechanicalVentilation = mechanicalVentilation;
        this.SupplementaryVentilatorySupport = supplementaryVentilatorySupport;
        this.CareOfArtificialAirways = careOfArtificialAirways;
        this.TreatmentLungFunction = treatmentLungFunction;
        this.StandardMonitoring = standardMonitoring;
        this.LaboratoryInvestigations = laboratoryInvestigations;
        this.SingleMedication = singleMedication;
        this.MultipleIntravenousMedications = multipleIntravenousMedications;
        this.RoutineDressingChanges = routineDressingChanges;
        this.FrequentDressingChanges = frequentDressingChanges;
        this.CareOfDrains = careOfDrains;
        this.SingleVasoactiveMedication = singleVasoactiveMedication;
        this.MultipleVasoactiveMedications = multipleVasoactiveMedications;
        this.IntravenousReplacementOfLargeFluidLosses = intravenousReplacementOfLargeFluidLosses;
        this.PeripheralArterialCatheter = peripheralArterialCatheter;
        this.LeftAtriumMonitoring = leftAtriumMonitoring;
        this.CentralVenousLine = centralVenousLine;
        this.CardiopulmonaryResuscitation = cardiopulmonaryResuscitation;
        this.Hemofiltration = hemofiltration;
        this.QuantitativeUrineOutputMeasurement = quantitativeUrineOutputMeasurement;
        this.ActiveDiuresis = activeDiuresis;
        this.MeasurementOfIntracranialPressure = measurementOfIntracranialPressure;
        this.AcidosisAlkalosis = acidosisAlkalosis;
        this.IntravenousHyperalimentation = intravenousHyperalimentation;
        this.EnteralFeeding = enteralFeeding;
        this.SingleInterventionsInICU = singleInterventionsInICU;
        this.MultipleInterventionsInICU = multipleInterventionsInICU;
        this.InterventionsOutsideOfICU = interventionsOutsideOfICU;

        //ApacheRelated
        this.HeartRate = heartRate;
        this.EndStageDisease = endStageDisease;
        this.MeanArterialPressure = meanArterialPressure;
        this.Temperature = temperature;
        this.PaO2 = paO2;
        this.AaO2 = aaO2;
        this.RespiratoryRate = respiratoryRate;
        this.SerumSodium = serumSodium;
        this.ArterialPH = arterialPH;
        this.SerumHCO3 = serumHCO3;
        this.SerumCreatinine = serumCreatinine;
        this.SerumPotassium = serumPotassium;
        this.Glasgow = glasgow;
        this.WBC = wbc;
        this.Ht = ht;
        this.ChronicOrganInsufficiency = chronicOrganInsufficiency;

    }
}