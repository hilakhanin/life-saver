export class Patient {

    constructor(public idCard: string,
        public isAlive: boolean,
        public dateOfBirth: Date,
        public dateOfAdmission: Date,
        public isNeedsDialysis: boolean,
        public daysInICU: number,
        public tiss28?: number,
        public apache2?: number) { }

}