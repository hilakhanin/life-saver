import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientService } from './patient.service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit, OnDestroy {

  listData: MatTableDataSource<any>;
  displayedColumns: string[] = ['idCard', 'isAlive', 'dateOfBirth', 'dateOfAdmission'];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  searchKey: string;
  isLoadingResults = true;
  subscription: Subscription;


  constructor(private dataService: DataService, private router: Router,
    private route: ActivatedRoute, private patientService: PatientService) { }

  ngOnInit() {
    this.subscription = this.patientService.allPatientsChanged
      .subscribe(
        () => {
          this.getData();
        }
      );
  }

  getData() {
    this.isLoadingResults = true;

    this.dataService.fetchAllPatients().subscribe(
      data => {
        if ((this.listData === undefined || this.listData.filter === "") && data !== null) {
          this.listData = new MatTableDataSource(data);
          this.listData.sort = this.sort;
          this.listData.paginator = this.paginator;
          this.listData.filterPredicate = (data, filter) => {
            return this.displayedColumns.some(element => {
              return element === 'idCard' && data[element].toLowerCase().indexOf(filter) != -1;
            })
          };
        }

        this.isLoadingResults = false;
      },
      error => {
        console.log(error);
        this.isLoadingResults = false;
      }
    );
  }

  onSearchClear() {
    this.searchKey = '';
    this.applyFilter();
  }

  applyFilter() {
    if (this.listData !== undefined) {
      this.listData.filter = this.searchKey.trim().toLowerCase();
    }
  }

  //user table row click event
  getRecord(row) {
    this.router.navigate(['../', 'patient', row.idCard], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
