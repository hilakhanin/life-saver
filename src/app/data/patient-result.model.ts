export class PatientResult {

    constructor(
        public PatientIdCard: string,
        public IndexTypeName: string,
        public Date: Date,
        public Result: number,
        public IsEdit: boolean,
        public MinValue?: number,
        public MaxValue?: number,
        public IsBoolean?: boolean,
        public Increment?: number,
        public IndexTypeId?: number,
        public Position?: number
    ) { }

}