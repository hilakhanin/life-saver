import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, CanActivateChild, Router } from "@angular/router";
import { Observable } from "rxjs/internal/Observable";
import { IndexTypeService } from "../../settings/index-types/index-type.service";

@Injectable({
  providedIn: 'root'
})
export class ErrorPageGuard implements CanActivate, CanActivateChild {

  constructor(private indexTypeService: IndexTypeService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    //TODO: works when navigating programmatically, but not when navigating manually

    let state_id = state.url.split('/')[state.url.split('/').length - 1];
    let route_id = +route.params.id;
    let id = Object.keys(route.params).length > 0 ? route_id : (!isNaN(+state_id) ? +state_id : -1);


    if ((Object.keys(route.params).length === 0)
      || (this.indexTypeService.getIndexType(id) !== undefined)) {
      return true;
    }
    else {
      this.router.navigate(['/']);
      return false;
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(route, state);
  }
}
