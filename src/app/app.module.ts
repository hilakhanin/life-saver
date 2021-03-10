import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { CKEditorModule } from 'ng2-ckeditor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material/material.module';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { DataComponent } from './data/data.component';
import { PatientListComponent } from './data/patient-list/patient-list.component';
import { SettingsComponent } from './settings/settings.component';
import { IndexTypesComponent } from './settings/index-types/index-types.component';
import { IndexTypeListComponent } from './settings/index-types/index-type-list/index-type-list.component';
import { IndexTypeItemComponent } from './settings/index-types/index-type-list/index-type-item/index-type-item.component';
import { IndexTypeStartComponent } from './settings/index-types/index-type-start/index-type-start.component';
import { IndexTypeEditComponent } from './settings/index-types/index-type-edit/index-type-edit.component';
import { IndexTypeDetailComponent } from './settings/index-types/index-type-detail/index-type-detail.component';
import { YesNoPipe } from './shared/yes-no.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { PatientComponent } from './data/patient/patient.component';
import { PatientDetailComponent } from './data/patient/patient-detail/patient-detail.component';
import { DeleteResultDialogComponent } from './data/patient/patient-detail/delete-result-dialog/delete-result-dialog.component';
import { FieldsRequiredDialogComponent } from './data/patient/patient-detail/fields-required-dialog/fields-required-dialog.component';
import { DuplicateNameValidator } from './settings/index-types/index-type-edit/duplicate-name-validator.directive';
import { DialogFileGenerationComponent } from './data/dialog-file-generation/dialog-file-generation.component';
import { DialogImportErrorComponent } from './data/dialog-import-error/dialog-import-error.component';
import { GraphDialogComponent } from './dashboard/graph-list/graph-dialog/graph-dialog.component';
import { GraphListComponent } from './dashboard/graph-list/graph-list.component';
import { GraphTypePipe } from './dashboard/graph-list/graph-type.pipe';
import { ChartComponent } from './dashboard/chart/chart.component';
import { DeleteGraphDialogComponent } from './dashboard/graph-list/delete-graph-dialog/delete-graph-dialog.component';
import { RulesComponent } from './rules/rules.component';
import { RulesDetailsComponent } from './rules/rules-details/rules-details.component';
import { RulesEditComponent } from './rules/rules-edit/rules-edit.component';
import { RulesListComponent } from './rules/rules-list/rules-list.component';
import { RulesStartComponent } from './rules/rules-start/rules-start.component';
import { RulesItemComponent } from './rules/rules-list/rules-item/rules-item.component';
import { ConfigurationComponent } from './settings/configuration/configuration.component';
import { TileSelectorComponent } from './settings/configuration/tile-selector/tile-selector.component';
import { TilesComponent } from './dashboard/tiles/tiles.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PatientRiskGroupsComponent } from './data/patient/patient-detail/patient-risk-groups/patient-risk-groups.component';
import { HighLowPipe } from './shared/high-low.pipe';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    LoadingSpinnerComponent,
    DataComponent,
    PatientListComponent,
    SettingsComponent,
    IndexTypesComponent,
    IndexTypeListComponent,
    IndexTypeItemComponent,
    IndexTypeStartComponent,
    IndexTypeEditComponent,
    IndexTypeDetailComponent,
    YesNoPipe,
    ErrorPageComponent,
    PatientComponent,
    PatientDetailComponent,
    DeleteResultDialogComponent,
    FieldsRequiredDialogComponent,
    DuplicateNameValidator,
    DialogFileGenerationComponent,
    DialogImportErrorComponent,
    GraphDialogComponent,
    GraphListComponent,
    GraphTypePipe,
    ChartComponent,
    DeleteGraphDialogComponent,
    RulesComponent,
    RulesDetailsComponent,
    RulesEditComponent,
    RulesListComponent,
    RulesStartComponent,
    RulesItemComponent,
    ConfigurationComponent,
    TileSelectorComponent,
    TilesComponent,
    PatientRiskGroupsComponent,
    HighLowPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    NgbModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CKEditorModule,
    FlexLayoutModule
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
