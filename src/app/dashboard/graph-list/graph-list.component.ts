import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { DashboardService } from '../dashboard.service';
import { GraphDialogComponent } from './graph-dialog/graph-dialog.component';
import { Graph } from './graph.model';
import { GraphService } from './graph.service';

@Component({
  selector: 'app-graph-list',
  templateUrl: './graph-list.component.html',
  styleUrls: ['./graph-list.component.css']
})
export class GraphListComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  graphs: Graph[] = [];
  displayedColumns: string[] = ['name', 'type'];
  listData: MatTableDataSource<any>;
  graph: Graph;

  constructor(private dialog: MatDialog,
    private graphService: GraphService,
    private dashboardService: DashboardService) { }

  ngOnInit() {
    this.subscription = this.dashboardService.allGraphsChanged
      .subscribe(
        () => {
          this.getData();
        }
      );

    this.dashboardService.currentGraph.subscribe(id => {
      this.graph = this.graphs.find(g => g.Id == id);
    });
  }

  getData() {
    this.graphs = this.dashboardService.getAllGraphs();
    this.listData = new MatTableDataSource(this.graphs);
  }

  addGraph() {
    this.openDialog(null);
  }

  editGraph(row) {
    this.openDialog(row);
  }

  deleteGraph(id: number) {
    this.graphService.deleteGraph(id).subscribe(() => {
      this.graphs.splice(this.graphs.findIndex(g => g.Id == id), 1);
      this.dashboardService.setAllGraphs(this.graphs);
      this.listData = new MatTableDataSource(this.graphs);
      this.listData._updateChangeSubscription();
    });
  }

  openDialog(row?: Graph) {
    const dialogRef = this.dialog.open(GraphDialogComponent, {
      width: '50vw',
      data: {
        graph: row
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.graphToDelete > -1) { // delete
          this.deleteGraph(result.graphToDelete);
        }
        else if (result.data) { // add or edit
          const graph_obj = new Graph(row?.Id,
            result.data.value.name,
            result.data.value.types,
            result.data.value.isBoolean,
            +result.data.value.axes.axisX,
            +result.data.value.axes.axisY,
            row?.Position
          );

          this.onSubmit(graph_obj);

        }
      }
    });
  }

  onSubmit(graph_obj: Graph) {
    if (graph_obj.Id >= 0) { // edit
      this.graphService.saveGraph(graph_obj).subscribe(() => {
        this.getData();
      });
    } else { // add
      const existing_graphs = this.dashboardService.getAllGraphs(),
        length = existing_graphs && existing_graphs.length > 0 ?
          ++existing_graphs[existing_graphs.length - 1].Id :
          0; // after last, because something from the middle may have been deleted
      this.graphService.saveGraph(graph_obj, length).subscribe(() => {
        this.getData();
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
