import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { IndexType } from '../../settings/index-types/index-type.model';
import { SharedService } from '../../shared/shared.service';
import { DashboardService } from '../dashboard.service';
import { Graph } from './graph.model';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  index_types: IndexType[] = [];

  constructor(private http: HttpClient, private dashboardService: DashboardService, private sharedService: SharedService) { }

  saveGraph(graph: Graph, length?: number): Observable<any> {
    if (graph.Position !== undefined) {
      return this.http.patch(`https://life-saver-backend.firebaseio.com/graphs/${graph.Position}.json`, {
        Id: graph.Id,
        Name: graph.Name,
        TypeId: graph.TypeId,
        IsBoolean: graph.IsBoolean,
        AxisXId: graph.AxisXId,
        AxisYId: graph.AxisYId,
        Position: graph.Position
      }).pipe(
        tap(() => {
          this.fetchAllGraphs().subscribe();
        }),
        catchError(this.sharedService.handleError)
      );
    }
    else {
      return this.http.put(`https://life-saver-backend.firebaseio.com/graphs/${length}.json`, {
        Id: length,
        Name: graph.Name,
        TypeId: graph.TypeId,
        IsBoolean: graph.IsBoolean,
        AxisXId: graph.AxisXId,
        AxisYId: graph.AxisYId,
        Position: length
      }).pipe(
        map(result => result),
        tap(() => {
          this.fetchAllGraphs().subscribe();
        }),
        catchError(this.sharedService.handleError)
      );
    }
  }

  fetchAllGraphs() {
    return this.http.get<Graph[]>('https://life-saver-backend.firebaseio.com/graphs.json')
      .pipe(
        map(results => results != null ?
          Object.values(results)
            .filter(val => {
              return val != null;
            }) :
          results),
        tap(result => {
          this.dashboardService.setAllGraphs(result);
        })
      );
  }

  deleteGraph(graphId: number) {
    return this.http
      .delete<Graph>(`https://life-saver-backend.firebaseio.com/graphs/${graphId}.json`)
      .pipe(
        retry(2),
        catchError(this.sharedService.handleError)
      )
  }
}
