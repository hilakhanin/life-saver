export class Rule {
    Id: number;
    Name: string;
    Equation: string;
    Cutoff: number;
    IsActive: boolean;
    Position?: number;

    constructor(id: number, name: string, equation: string, cutoff: number, active: boolean, position: number) {
        this.Id = id;
        this.Name = name;
        this.Equation = equation;
        this.Cutoff = cutoff;
        this.IsActive = active;
        this.Position = position;
    }
}