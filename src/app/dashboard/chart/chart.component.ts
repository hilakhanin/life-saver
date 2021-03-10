import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IndexType } from '../../settings/index-types/index-type.model';
import { SettingService } from '../../settings/settings.service';
import { ChartApi, ChartService } from './chart.service';
import { Chart } from 'chart.js';
import { DashboardService } from '../dashboard.service';
import { Graph } from '../graph-list/graph.model';
import { ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { HelperService } from '../../shared/helper.service';
import { PatientIndexTypeResult } from '../../data/patientIndexTypeResult.model';
import { takeUntil, tap } from 'rxjs/operators';
import { ChronicOrganInsufficiencyEnum } from '../../shared/file-generator/chronic-organ-insufficiency.enum';
import { EndStageDiseaseEnum } from '../../shared/file-generator/end-stage-disease.enum';
import { SharedService } from '../../shared/shared.service';


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {

  chart = [];
  index_types: IndexType[] = [];
  patient_data: ChartApi[] = [];
  graphs: Graph[] = [];
  graph: Graph;

  @ViewChild('canvas') canvas: ElementRef;
  context = [];
  elementForScrolling;
  destroy: ReplaySubject<any> = new ReplaySubject<any>(1); // to emit the last message in case the subscription is ended after the component is destroyed


  constructor(private chartService: ChartService,
    private settingService: SettingService,
    private dashboardService: DashboardService,
    private helperService: HelperService,
    private translateService: TranslateService,
    private sharedService: SharedService) {

    this.settingService.fetchIndexTypes(true)
      .pipe(
        tap(res => {
          this.index_types = res;
        }),
        takeUntil(this.destroy)
      )
      .subscribe();

  }

  ngOnInit() {
    this.translateService.get('app.charts')
      .pipe(
        takeUntil(this.destroy)
      )
      .subscribe();
  }

  ngAfterViewInit() {

    this.context = this.canvas.nativeElement.getContext('2d');

    this.dashboardService.allGraphsChanged
      .pipe(
        tap(() => {
          this.getGraph();
        }),
        takeUntil(this.destroy)
      )
      .subscribe();
  }

  getGraph() {
    this.chartService.patientData()
      .pipe(tap(res => {
        this.patient_data = res;
        this.graphs = this.dashboardService.getAllGraphs();

        if (this.graphs && this.graphs.length > 0 && this.patient_data.length > 0) {

          if (!this.graph || this.graph.Id !== this.graphs[0].Id || this.graphs.length === 1) {
            this.graph = this.graphs[0];
          }

          if (this.graph) {
            this.dashboardService.changeGraphOnDisplay(this.graph.Position);
            this.generateGraph(this.graph, this.patient_data);
          }
        }
        else {
          this.graph = null;
        }
      }),
        takeUntil(this.destroy)
      )
      .subscribe();
  }

  slideNext() {
    let pos = this.graphs.findIndex(g => g.Id == this.graph.Id),
      temp = this.graphs[++pos];
    this.graph = temp ? temp : this.graphs[0];
    this.dashboardService.changeGraphOnDisplay(this.graph.Position);

    this.generateGraph(this.graph, this.patient_data);

    this.elementForScrolling = document.getElementsByClassName('current-graph')[0];

    document.getElementById('graph-table').scrollTop =
      this.elementForScrolling.offsetTop > document.getElementById('graph-table').scrollHeight ?
        0 : this.elementForScrolling.offsetTop;
  }

  slidePrev() {
    let pos = this.graphs.findIndex(g => g.Id == this.graph.Id),
      temp = this.graphs[--pos];
    this.graph = temp ? temp : this.graphs[this.graphs.length - 1];
    this.dashboardService.changeGraphOnDisplay(this.graph.Position);

    this.generateGraph(this.graph, this.patient_data);

    this.elementForScrolling = document.getElementsByClassName('current-graph')[0];
    this.elementForScrolling.scrollIntoView({ block: "nearest" });
  }

  generateGraph(graph: Graph, res: ChartApi[]) {
    let local_chart: Chart;

    switch (graph.TypeId) {
      case undefined:
      case null:
        this.chart = null;
        break;
      case 0:
        local_chart = this.generateScatterPlot(graph, res);
        break;
      case 1:
        local_chart = this.generateBarChart(graph, res);
        break;
      case 2:
        local_chart = this.generatePieChart(graph, res);
        break;
      default:
        this.chart = null;
    }

    this.chart = new Chart(this.context, local_chart);
  }

  generateBarChart(graph: Graph, res: ChartApi[]) {

    let storage = this.sharedService.calculateStorageForChart(graph, res, this.index_types),
      axisXName = this.index_types.find(s => s.ID == graph.AxisXId).Name,
      axisYName = this.index_types.find(s => s.ID == graph.AxisYId).Name;

    const [pass, fail] =
      storage.reduce(([p, f], element) =>
        (element.x == true || element.x > 0 ?
          [[...p, element], f] :
          [p, [...f, element]]),
        [[], []]),
      avg_pass = pass.map(m => m.y).reduce((acc, curr) => acc + curr, 0) / storage.length,
      avg_fail = fail.map(m => m.y).reduce((acc, curr) => acc + curr, 0) / storage.length;

    return {
      type: 'bar',
      data: {
        labels: [axisXName, graph.AxisXId == - 6 ? this.translateService.instant('app.charts.dead') : this.translateService.instant('app.charts.without') + axisXName],
        datasets: [{
          backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'],
          barThickness: 90,
          data: [avg_pass.toFixed(2), avg_fail.toFixed(2)]
        }]
      },
      options: {
        events: [],
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: this.translateService.instant('app.charts.researchGroup')
            }
          }],
          yAxes: [{
            display: true,
            ticks: {
              beginAtZero: true
            },
            scaleLabel: {
              display: true,
              labelString: this.translateService.instant('app.charts.averageScore', { axisYName: axisYName })
            }
          }],
        }
      }
    };
  }

  generateScatterPlot(graph: Graph, res: ChartApi[]) {
    let storage = this.sharedService.calculateStorageForChart(graph, res, this.index_types),
      axisXName = this.index_types.find(s => s.ID == graph.AxisXId).Name,
      axisYName = this.index_types.find(s => s.ID == graph.AxisYId).Name;

    return {
      type: 'scatter',
      data: {
        labels: [axisXName, axisYName],
        datasets: [{
          borderColor: 'rgba(54, 162, 235, 0.5)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          data: storage
        }]
      },
      options: {
        events: [],
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true,
            ticks: {
              beginAtZero: true,
              stepSize: 10
            },
            scaleLabel: {
              display: true,
              labelString: axisXName
            }
          }],
          yAxes: [{
            display: true,
            ticks: {
              beginAtZero: true,
              stepSize: 10
            },
            scaleLabel: {
              display: true,
              labelString: axisYName
            }
          }],
        }
      }
    };
  }

  generatePieChart(graph: Graph, res: ChartApi[]) {
    let axisX = this.index_types.find(s => s.ID == graph.AxisXId).Marking.toLowerCase(),
      source_results = [].concat(...res.map(res => res.results).map(m => m.filter(n => n.indexTypeId == graph.AxisXId))),
      source_patients = this.helperService.modifyPropertyForFiltering(res).map(m => m[axisX]);

    const index_type = this.index_types.find(i => i.ID == graph.AxisXId),
      source = source_results.length ? source_results : source_patients,
      [pass, fail] = source.reduce(([p, f], e) => ((e.result != undefined && e.result > 0) || e > 0 ? [[...p, e], f] : [p, [...f, e]]), [[], []]),
      percentPass = Math.round(pass.length / source.length * 100),
      percentFail = Math.round(fail.length / source.length * 100);

    return {
      type: 'pie',
      data: {
        labels: [this.translateService.instant('app.charts.withPercent', { percent: percentPass }), this.translateService.instant('app.charts.withoutPercent', { percent: percentFail })],
        datasets: [
          {
            data: [pass.length, fail.length],
            fill: true,
            backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'],
          }
        ]
      },
      options: {
        events: [],
        title: {
          display: true,
          text: graph.AxisXId == - 6 ? this.translateService.instant('app.charts.totalAlivePatients') : this.translateService.instant('app.charts.totalPatientsWith', { index: index_type.Name })
        }
      }
    };
  }

  ngOnDestroy() {
    this.destroy.next(null);
  }
}
