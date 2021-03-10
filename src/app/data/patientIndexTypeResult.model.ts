export class PatientIndexTypeResult {

    constructor(public patientIdCard: string,
        public indexTypeId: number,
        public date: Date, //TISS-28 - 24 hours after admission, Apache-2 - 24 hours before discharge
        public result: any,
        public position?: number
    ) { }

}