import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataComponent } from './data/data.component';
import { SettingsComponent } from './settings/settings.component';
import { IndexTypesComponent } from './settings/index-types/index-types.component';
import { IndexTypeStartComponent } from './settings/index-types/index-type-start/index-type-start.component';
import { IndexTypeEditComponent } from './settings/index-types/index-type-edit/index-type-edit.component';
import { IndexTypeDetailComponent } from './settings/index-types/index-type-detail/index-type-detail.component';
import { IndexTypeResolverService } from './settings/index-types/index-type-resolver.service';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { PatientListComponent } from './data/patient-list/patient-list.component';
import { PatientComponent } from './data/patient/patient.component';
import { PatientDetailComponent } from './data/patient/patient-detail/patient-detail.component';
import { PatientResolverService } from './data/patient-resolver.service';
import { GraphResolverService } from './dashboard/graph-list/graph-resolver.service';
import { RulesComponent } from './rules/rules.component';
import { RulesStartComponent } from './rules/rules-start/rules-start.component';
import { RulesEditComponent } from './rules/rules-edit/rules-edit.component';
import { RulesDetailsComponent } from './rules/rules-details/rules-details.component';
import { RulesResolverService } from './rules/rules-resolver.service';
import { ConfigurationComponent } from './settings/configuration/configuration.component';

//TODO: Implement lazy loading
const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'data', component: DataComponent,
    children: [
      { path: '', redirectTo: 'patient-list', pathMatch: 'full' },
      { path: 'patient-list', component: PatientListComponent, resolve: [PatientResolverService] },
      {
        path: 'patient', component: PatientComponent,
        children: [
          { path: '', redirectTo: 'new', pathMatch: 'full' },
          { path: 'new', component: PatientDetailComponent },
          { path: ':id', component: PatientDetailComponent }
        ]
      }
    ]
  },
  { path: 'dashboard', component: DashboardComponent, resolve: [PatientResolverService, GraphResolverService, RulesResolverService] },
  {
    path: 'rules', component: RulesComponent,
    resolve: [RulesResolverService],
    children: [
      { path: '', component: RulesStartComponent },
      { path: 'new', component: RulesEditComponent },
      {
        path: ':id',
        component: RulesDetailsComponent,
        resolve: [RulesResolverService]
      },
      {
        path: ':id/edit',
        component: RulesEditComponent,
        resolve: [RulesResolverService]
      }
    ]
  },
  {
    path: 'settings', component: SettingsComponent,
    //TODO: add authentication guard for navigating to Settings
    children: [
      { path: '', redirectTo: 'index-types', pathMatch: 'full' },
      {
        path: 'index-types', component: IndexTypesComponent,
        resolve: [IndexTypeResolverService],
        // canActivateChild: [ErrorPageGuard], //TODO: add guard to prevent navigating to a non-existent ID, and also in :id/edit
        children: [
          { path: '', component: IndexTypeStartComponent },
          { path: 'new', component: IndexTypeEditComponent },
          {
            path: ':id',
            component: IndexTypeDetailComponent,
            resolve: [IndexTypeResolverService]
          },
          {
            path: ':id/edit',
            component: IndexTypeEditComponent,
            resolve: [IndexTypeResolverService]
          }
        ]
      },
      { path: 'configuration', component: ConfigurationComponent}
    ]
  },
  { path: 'not-found', component: ErrorPageComponent, data: { message: 'Page not found!' } },
  { path: '**', redirectTo: '/not-found', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
