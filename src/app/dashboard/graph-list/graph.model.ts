export const graphTypes = [
    { Id: 0, Name: 'scatter_plot' },
    { Id: 1, Name: 'bar_chart' },
    { Id: 2, Name: 'pie_chart' }
];

export class Graph {
    constructor(public Id: number,
        public Name: string,
        public TypeId: number,
        public IsBoolean: boolean,
        public AxisXId: number,
        public AxisYId?: number,
        public Position?: number) { }
}