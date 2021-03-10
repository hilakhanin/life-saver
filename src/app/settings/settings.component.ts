import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private route: ActivatedRoute, private sharedService: SharedService) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['showSnackbar'] != undefined && params['snackbarMessage'] != undefined) {
        this.sharedService.openSnackBar(params['snackbarMessage'], 'Error');
      }
    });
  }
}
