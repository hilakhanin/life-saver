import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Graph } from './graph-list/graph.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private allGraphs: Graph[] = [];
  allGraphsChanged = new BehaviorSubject<Graph[]>(null);
  
  private graphSource = new Subject<number>(); // Subject, because there is no need to keep the first one before scrolling
  currentGraph = this.graphSource.asObservable();

  constructor() { }

  getAllGraphs() {
    return this.allGraphs !== null ? this.allGraphs.slice() : this.allGraphs;
  }

  setAllGraphs(all_graphs: Graph[]) {
    this.allGraphs = all_graphs;
    this.allGraphsChanged.next(this.allGraphs !== null ? this.allGraphs.slice() : this.allGraphs);
  }

  changeGraphOnDisplay(id: number) {
    this.graphSource.next(id);
  }
}
