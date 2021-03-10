//At the moment, as this is a little out of scope, this will be hard coded.
//I choose not to put this is an enum, because, in the future, I would like for the users to be able to handle this
export const categories = [
    { Id: 0, Name: 'General' },
    { Id: 1, Name: 'TISS-28' },
    { Id: 2, Name: 'Apache-2' }
];

export const general_data = ['PatientIdCard', 'BirthDate', 'DaysInICU', 'IsNeedsDialysis', 'IsAlive', 'DateOfAdmission'];

export const mutually_exclusive = [
    ['PaO2', 'AaO2'],
    ['ArterialPH', 'SerumHCO3']
];

export class IndexType {
    ID: number;
    Name: string;
    MinValue: number;
    MaxValue: number;
    UnitOfMeasurement: string;
    IsBoolean: boolean;
    Increment?: number;
    CategoryId: number;
    Marking?: string;

    constructor(id: number, name: string, minValue: number, maxValue: number, unitOfMeasurement: string,
        isBoolean: boolean, increment: number, categoryId: number, marking: string) {
        this.ID = id;
        this.Name = name;
        this.MinValue = minValue;
        this.MaxValue = maxValue;
        this.UnitOfMeasurement = unitOfMeasurement;
        this.IsBoolean = isBoolean;
        this.Increment = increment;
        this.CategoryId = categoryId;
        this.Marking = marking;
    }
}