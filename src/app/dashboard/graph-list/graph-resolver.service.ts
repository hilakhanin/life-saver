import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DashboardService } from '../dashboard.service';
import { Graph } from './graph.model';
import { GraphService } from './graph.service';

@Injectable({
  providedIn: 'root'
})
export class GraphResolverService implements Resolve<Graph[]> {

  constructor(private dashboardService: DashboardService, private graphService: GraphService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Graph[]> | Promise<Graph[]> | Graph[] {
    const graphs = this.dashboardService.getAllGraphs();

    if (graphs === null || graphs.length === 0) {
      return this.graphService.fetchAllGraphs();
    } else {
      return graphs;
    }
  }
}
